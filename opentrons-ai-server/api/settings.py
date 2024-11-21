import os
from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH: Path = Path(Path(__file__).parent.parent, ".env")


def is_running_in_docker() -> bool:
    return os.path.exists("/.dockerenv")


class Settings(BaseSettings):
    """
    If the env_file file exists: It will read the configurations from the env_file file (local execution)
    If the env_file file does not exist:
    It will read the configurations from the environment variables set in the operating system (deployed execution)
    If the variable is not set in the OS the default value is used (this is just for creating the .env file with default values)
    """

    model_config = SettingsConfigDict(env_file=ENV_PATH, env_file_encoding="utf-8", extra='ignore')
    environment: str = "local"
    huggingface_simulate_endpoint: str = "https://Opentrons-simulator.hf.space/protocol"
    log_level: str = "info"
    service_name: str = "local-ai-api"
    openai_model_name: str = "gpt-4-1106-preview"
    auth0_domain: str = "dev-6xct6ddhil0ooeri.us.auth0.com"
    auth0_api_audience: str = "MOTHJrrAyHOZFXtIN7ptzvWUwHemPZjU"
    auth0_issuer: str = "https://dev-6xct6ddhil0ooeri.us.auth0.com/"
    auth0_algorithms: str = "RS256"
    dd_version: str = "hardcoded_default_from_settings"
    allowed_origins: str = "*"
    dd_trace_enabled: str = "false"
    cpu: str = "1028"
    memory: str = "2048"

    # Secrets
    # These come from environment variables in the local and deployed execution environments
    openai_api_key: SecretStr = SecretStr(os.getenv("OPENAI_API_KEY"))
    huggingface_api_key: SecretStr = SecretStr("default_huggingface_api_key")

    db_host: SecretStr = SecretStr(os.getenv("DB_HOST"))
    db_name: SecretStr = SecretStr(os.getenv("DB_NAME"))
    db_user: SecretStr = SecretStr(os.getenv("DB_USER"))
    db_password: SecretStr = SecretStr(os.getenv("DB_PASSWORD"))
    db_type: str = os.getenv("DB_TYPE")
    ddb_table_history: str = os.getenv("DDB_TABLE_HISTORY", "")
    ddb_table_tenants: str = os.getenv("DDB_TABLE_TENANTS", "")
    ddb_table_org_members: str = os.getenv("DDB_TABLE_ORG_MEMBERS", "")
    aws_access_key: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_key: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    aws_region: str = os.getenv("AWS_REGION_NAME", "us-east-1")
    Auth0Domain: str = os.getenv("Auth0Domain", "")
    Auth0ClientId: str = os.getenv("Auth0ClientId", "")
    Auth0ClientSecret: str = os.getenv("Auth0ClientSecret", "")

    @property
    def json_logging(self) -> bool:
        if self.environment == "local" and not is_running_in_docker():
            return False
        return True

    @property
    def logger_name(self) -> str:
        return "app.logger"


def get_settings_from_json(json_str: str) -> Settings:
    """
    Validates the settings from a json string.
    """
    return Settings.model_validate_json(json_str)


def generate_env_file(settings: Settings) -> None:
    """
    Generates a .env file from the current settings including defaults.
    """
    with open(ENV_PATH, "w") as file:
        for field, value in settings.model_dump().items():
            if value is not None:
                if isinstance(value, SecretStr):
                    value = value.get_secret_value()
                file.write(f"{field.upper()}={value}\n")
    print(f".env file generated at {str(ENV_PATH)}")


# Example usage
if __name__ == "__main__":
    config: Settings = Settings()
    generate_env_file(config)
