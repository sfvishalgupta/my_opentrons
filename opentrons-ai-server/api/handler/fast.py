import asyncio
import os
import time
from typing import Any, Awaitable, Callable, List, Literal, Union
import boto3
import uuid
import requests
from botocore.exceptions import ClientError
import structlog
from asgi_correlation_id import CorrelationIdMiddleware
from asgi_correlation_id.context import correlation_id
from ddtrace import tracer
from ddtrace.contrib.asgi.middleware import TraceMiddleware
from fastapi import FastAPI, HTTPException, Query, Request, Response, Security, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field, conint
from starlette.middleware.base import BaseHTTPMiddleware
from uvicorn.protocols.utils import get_path_with_query_string
from datetime import datetime
from urllib.parse import urlparse


from api.domain.fake_responses import FakeResponse, get_fake_response
from api.domain.openai_predict import OpenAIPredict
from api.handler.custom_logging import setup_logging
from api.integration.auth import VerifyToken
from api.models.chat_request import ChatRequest
from api.models.chat_response import ChatResponse
from api.models.empty_request_error import EmptyRequestError
from api.models.internal_server_error import InternalServerError
from api.settings import Settings

settings: Settings = Settings()
setup_logging(json_logs=settings.json_logging, log_level=settings.log_level.upper())

access_logger = structlog.stdlib.get_logger("api.access")
logger = structlog.stdlib.get_logger(settings.logger_name)

auth: VerifyToken = VerifyToken()
openai: OpenAIPredict = OpenAIPredict(settings)


# Initialize FastAPI app with metadata
app = FastAPI(
    title="Opentrons AI API",
    description="An API for generating chat responses.",
    version=os.getenv("DD_VERSION", "local"),
    openapi_url="/api/openapi.json",
    timeout=180
)

dynamodb = boto3.resource(
    "dynamodb", aws_access_key_id=settings.aws_access_key, aws_secret_access_key=settings.aws_secret_key, region_name=settings.aws_region
)
tableHistory = dynamodb.Table(settings.ddb_table_history)
tableTenants = dynamodb.Table(settings.ddb_table_tenants)
tableOrgMembers = dynamodb.Table(settings.ddb_table_org_members)


# CORS and PREFLIGHT settings
# ALLOWED_ORIGINS is now an environment variable
ALLOWED_CREDENTIALS: bool = True
ALLOWED_METHODS: List[str] = ["GET", "POST", "OPTIONS"]
ALLOWED_HEADERS: List[str] = ["content-type", "authorization", "origin", "accept"]
ALLOWED_ACCESS_CONTROL_EXPOSE_HEADERS: List[str] = ["content-type"]
ALLOWED_ACCESS_CONTROL_MAX_AGE: str = "600"

# Add CORS middleware
origins = [
    "https://*.arc-saas.net",
    "http://localhost",
    "http://localhost:5137",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=ALLOWED_CREDENTIALS,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
    
)


# Add Timeout middleware
class TimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, timeout_s: int) -> None:
        super().__init__(app)
        self.timeout_s = timeout_s

    async def dispatch(self, request: Request, call_next: Any) -> JSONResponse | Any:
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout_s)
        except asyncio.TimeoutError:
            return JSONResponse({"detail": "API Request timed out"}, status_code=504)


# Control the timeout message by timing out before cloudfront would
# 2 seconds before the CloudFront timeout (180 seconds)
# 12 second before the uvicorn timeout (190 seconds)
# 22 seconds before the ALB timeout (200 seconds)
app.add_middleware(TimeoutMiddleware, timeout_s=178)


@app.middleware("http")
async def logging_middleware(request: Request, call_next) -> Response:  # type: ignore[no-untyped-def]
    structlog.contextvars.clear_contextvars()
    # These context vars will be added to all log entries emitted during the request
    request_id = correlation_id.get()
    structlog.contextvars.bind_contextvars(request_id=request_id)

    start_time = time.perf_counter_ns()
    # If the call_next raises an error, we still want to return our own 500 response,
    # so we can add headers to it (process time, request ID...)
    response = Response(status_code=500)
    try:
        response = await call_next(request)
    except Exception:
        structlog.stdlib.get_logger("api.error").exception("Uncaught exception")
        raise
    finally:
        process_time = time.perf_counter_ns() - start_time
        status_code = response.status_code
        url = get_path_with_query_string(request.scope)  # type: ignore[arg-type]
        client_host = request.client.host if request.client and request.client.host else "unknown"
        client_port = request.client.port if request.client and request.client.port else "unknown"
        http_method = request.method if request.method else "unknown"
        http_version = request.scope["http_version"]
        # Recreate the Uvicorn access log format, but add all parameters as structured information
        access_logger.info(
            f"""{client_host}:{client_port} - "{http_method} {url} HTTP/{http_version}" {status_code}""",
            http={
                "url": str(request.url),
                "status_code": status_code,
                "method": http_method,
                "request_id": request_id,
                "version": http_version,
            },
            network={"client": {"ip": client_host, "port": client_port}},
            duration=process_time,
        )
        response.headers["X-Process-Time"] = str(process_time / 10**9)
    return response


# This middleware must be placed after the logging, to populate the context with the request ID
# NOTE: Why last??
# Answer: middlewares are applied in the reverse order of when they are added (you can verify this
# by debugging `app.middleware_stack` and recursively drilling down the `app` property).
app.add_middleware(CorrelationIdMiddleware)

tracing_middleware = next((m for m in app.user_middleware if m.cls == TraceMiddleware), None)
if tracing_middleware is not None:
    app.user_middleware = [m for m in app.user_middleware if m.cls != TraceMiddleware]
    structlog.stdlib.get_logger("api.datadog_patch").info("Patching Datadog tracing middleware to be the outermost middleware...")
    app.user_middleware.insert(0, tracing_middleware)
    app.middleware_stack = app.build_middleware_stack()


# Models
class Status(BaseModel):
    status: Literal["ok", "error"]
    version: str


class UserDetails(BaseModel):
    status: Literal["ok", "error"]
    user: Any

class OrgMembers(BaseModel):
    status: Literal["ok", "error"]
    members: Any
    
class ChatHistory(BaseModel):
    status: Literal["ok", "error"]
    history: Any


class ErrorResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: Status


class TimeoutResponse(BaseModel):
    message: str


class CorsHeadersResponse(BaseModel):
    Access_Control_Allow_Origin: List[str] | str = Field(alias="Access-Control-Allow-Origin")
    Access_Control_Allow_Methods: List[str] | str = Field(alias="Access-Control-Allow-Methods")
    Access_Control_Allow_Headers: List[str] | str = Field(alias="Access-Control-Allow-Headers")
    Access_Control_Expose_Headers: List[str] | str = Field(alias="Access-Control-Expose-Headers")
    Access_Control_Max_Age: str = Field(alias="Access-Control-Max-Age")


def get_refer(request: Request):
    ref = request.headers.get("Referer")
    parsed_url = urlparse(ref)
    domain_name = parsed_url.netloc
    
    # Remove 'www.' if present
    if domain_name.startswith('www.'):
        domain_name = domain_name[4:]
    
    if domain_name == "localhost:5173" or domain_name == "localhost:8000": 
        domain_name = "opentrons-sourcefuse.arc-saas.net"
    logger.info(f"Referer is : {domain_name}")
    return domain_name


def get_org(referer):
    ddbResponse = tableTenants.scan(
        ProjectionExpression="id,org_name", FilterExpression="subdomain = :value", ExpressionAttributeValues={":value": referer}
    )
    if len(ddbResponse["Items"]) > 0:
        return ddbResponse["Items"][0]
    return None


@tracer.wrap()
@app.post(
    "/api/chat/completion",
    response_model=Union[ChatResponse, ErrorResponse],
    summary="Create Chat Completion",
    description="Generate a chat response based on the provided prompt.",
)
async def create_chat_completion(
    request: Request, body: ChatRequest, auth_result: Any = Security(auth.verify)  # noqa: B008
) -> Union[ChatResponse, ErrorResponse]:  # noqa: B008
    """
    Generate a chat completion response using OpenAI.

    - **request**: The HTTP request containing the chat message.
    - **returns**: A chat response or an error message.
    """
    logger.info("POST /api/chat/completion", extra={"body": body.model_dump(), "auth_result": auth_result})
    try:
        if not body.message or body.message == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=EmptyRequestError(message="Request body is empty").model_dump()
            )

        if body.fake:
            if body.fake_key is not None:
                fake: FakeResponse = get_fake_response(body.fake_key)
                return ChatResponse(reply=fake.chat_response.reply, fake=fake.chat_response.fake)
            return ChatResponse(reply="Default fake response.  ", fake=body.fake)
        ref = get_refer(request)
        org = get_org(ref)
        logger.info("Org found", extra=org)
        if org:
            tableHistory.put_item(
                Item={
                    "id": str(uuid.uuid4()),
                    "org_id": org["id"],
                    "user_id": auth_result["sub"],
                    "user_name": auth_result["name"],
                    "prompt": body.message,
                    "created_on": datetime.today().strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        response: Union[str, None] = openai.predict(prompt=body.message, chat_completion_message_params=body.history)
        if response is None or response == "":
            return ChatResponse(reply="No response was generated", fake=body.fake)

        return ChatResponse(reply=response, fake=body.fake)

    except Exception as e:
        logger.exception("Error processing chat completion")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=InternalServerError(exception_object=e).model_dump()
        ) from e

@app.get("/api/chat/history", response_model=ChatHistory, summary="Return Chat History", description="Return Chat History")
async def get_chathistory(request: Request, auth_result: Any = Security(auth.verify)) -> ChatHistory:
    """
    This api return organization chat history

    - **returns**: array of chat history for a organization
    """
    response = []
    try:
        ref = get_refer(request)
        org = get_org(ref)
        if org:
            org_id = org["id"]
            ddbHistoryResponse = tableHistory.scan(FilterExpression="org_id = :value", ExpressionAttributeValues={":value": org_id})
            response = ddbHistoryResponse["Items"]
        else:
            return ChatHistory(status="error", history=[])
    except Exception as e:
        pass
    return ChatHistory(status="ok", history=response)

@app.get(
    "/health",
    response_model=Status,
    summary="Load Balancer Health Check",
    description="Check the health and version of the API.",
    include_in_schema=False,
)
@app.get("/api/health", response_model=Status, summary="Health Check", description="Check the health and version of the API.")
async def get_health(request: Request) -> Status:
    """
    Perform a health check of the API.

    - **returns**: A Status containing the version of the API.
    """
    if request.url.path == "/health":
        pass  # This is a health check from the load balancer
    else:
        logger.info(f"{request.method} {request.url.path}", extra={"requestMethod": request.method, "requestPath": request.url.path})
    return Status(status="ok", version=settings.dd_version)

@app.get("/api/orgmembers", response_model=OrgMembers, summary="Members Details", description="Return User Details.")
async def get_orgmembers(request: Request, auth_result: Any = Security(auth.verify)) -> OrgMembers:
    """
    Perform a health check of the API.

    - **returns**: A Status containing the version of the API.
    """
    try:
        ref = get_refer(request)
        org = get_org(ref)
        if org:
            org_id = org["id"]
            token_url = f"https://{settings.Auth0Domain}/oauth/token"
            payload = {
                "grant_type": "client_credentials",
                "client_id": settings.Auth0ClientId,
                "client_secret": settings.Auth0ClientSecret,
                "audience": "https://" + settings.Auth0Domain + "/api/v2/",
            }
            authResponse = requests.post(token_url, json=payload)
            if authResponse.status_code == 200:
                access_token = authResponse.json()["access_token"]
                api_base_url = f"https://{settings.Auth0Domain}/api/v2/"
                list_member_url = f"{api_base_url}organizations/{org_id}/members"
                headers = {"Authorization": f"Bearer {access_token}"}
                params = {"page": 0, "per_page": 100}  # Pagination parameters
                response = requests.get(list_member_url, headers=headers, params=params)
                members = response.json()
                while response.links.get("next"):
                    params["page"] += 1
                    response = requests.get(list_member_url, headers=headers, params=params)
                    members.extend(response.json())
                return OrgMembers(status="ok", members=members)
                
            ddbResponse = tableOrgMembers.scan(ProjectionExpression="user_id,email,name",FilterExpression="org_id = :value", ExpressionAttributeValues={":value": org_id})
            return OrgMembers(status="ok", members=ddbResponse["Items"])
        else:
            return OrgMembers(status="error", members=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.get("/api/userinfo", response_model=UserDetails, summary="User Details", description="Return User Details.")
async def get_userinfo(request: Request, auth_result: Any = Security(auth.verify)) -> UserDetails:
    """
    Perform a health check of the API.

    - **returns**: A Status containing the version of the API.
    """
    try:
        ref = get_refer(request)
        org = get_org(ref)
        if org:
            org["name"] = auth_result["name"]
            org_id = org["id"]
            user_id = auth_result["sub"]
            token_url = f"https://{settings.Auth0Domain}/oauth/token"
            payload = {
                "grant_type": "client_credentials",
                "client_id": settings.Auth0ClientId,
                "client_secret": settings.Auth0ClientSecret,
                "audience": "https://" + settings.Auth0Domain + "/api/v2/",
            }
            authResponse = requests.post(token_url, json=payload)
            if authResponse.status_code == 200:
                access_token = authResponse.json()["access_token"]
                api_base_url = f"https://{settings.Auth0Domain}/api/v2/"
                headers = {"Authorization": f"Bearer {access_token}"}
                add_member_url = f"{api_base_url}organizations/{org_id}/members"
                payload = {"members": [user_id]}
                addMemberResponse = requests.post(add_member_url, headers=headers, json=payload)
                if addMemberResponse.status_code == 201:
                    print("Member added successfully")
                else:
                    print(f"Error: {addMemberResponse.text}")
                tableOrgMembers.put_item(
                    Item={
                        "user_id": user_id,
                        "org_id": org_id,
                        "org_name": org["org_name"],
                        "name": auth_result["name"],
                        "email": auth_result["email"]
                    }
                )
            else:
                print(f"Error: {authResponse.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return UserDetails(status="ok", user=org)


@tracer.wrap()
@app.get("/api/timeout", response_model=TimeoutResponse)
async def timeout_endpoint(request: Request, seconds: conint(ge=1, le=300) = Query(..., description="Number of seconds to wait")):  # type: ignore # noqa: B008
    """
    Wait for the specified number of seconds and then respond.

    - **seconds**: The number of seconds to wait (between 1 and 300).
    """
    # call me with http://localhost:8000/api/timeout?seconds=180
    logger.info(f"{request.method} {request.url.path}")
    try:
        await asyncio.sleep(seconds)  # Asynchronously wait for the specified time
        return TimeoutResponse(message=f"Waited for {seconds} seconds")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/api/redoc", include_in_schema=False)
async def redoc_html() -> HTMLResponse:
    return get_redoc_html(openapi_url="/api/openapi.json", title="Opentrons API Documentation")


@app.get("/api/doc", include_in_schema=False)
async def swagger_html() -> HTMLResponse:
    return get_swagger_ui_html(openapi_url="/api/openapi.json", title="Opentrons API Documentation")


@app.options(
    "/{path:path}", response_model=CorsHeadersResponse, summary="CORS Preflight Request", description="Handle CORS preflight requests."
)
async def handle_options(request: Request) -> JSONResponse:
    """
    Handle CORS preflight requests.

    This endpoint responds to CORS preflight requests with the appropriate headers.

    - **returns**: CORS headers.
    """
    logger.info(f"{request.method} {request.url.path}")
    response = CorsHeadersResponse.model_validate(
        {
            "Access-Control-Allow-Origin": settings.allowed_origins,
            "Access-Control-Allow-Methods": ALLOWED_METHODS,
            "Access-Control-Allow-Headers": ALLOWED_HEADERS,
            "Access-Control-Expose-Headers": ALLOWED_ACCESS_CONTROL_EXPOSE_HEADERS,
            "Access-Control-Max-Age": ALLOWED_ACCESS_CONTROL_MAX_AGE,
        }
    )
    return JSONResponse(response.model_dump(by_alias=True))


# General exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle validation errors.

    - **request**: The HTTP request that caused the error.
    - **exc**: The validation exception that was raised.
    - **returns**: A JSON response with a 422 status code and error details.
    """
    logger.error(f"Validation error for route {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"message": "Validation error", "details": exc.errors()})


@app.middleware("http")
async def custom_404_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    try:
        response = await call_next(request)
        if response.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED):
            logger.info(f"Route not found: {request.url.path}")
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": f"Route '{request.url.path}' not found"})
        return response
    except Exception as exc:
        logger.error(f"Error processing request: {exc}", exc_info=True)
        raise exc


# Catch-all handler for any other uncaught exceptions
@app.middleware("http")
async def catch_all_exceptions(request: Request, call_next: Any) -> JSONResponse | Any:
    """
    Catch all uncaught exceptions.

    - **request**: The HTTP request that caused the error.
    - **call_next**: The next middleware or route handler.
    - **returns**: A JSON response with a 500 status code if an exception is raised.
    """
    try:
        return await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled error for route {request.url.path}: {exc}")
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": "Internal server error"})
