// ToDo (kk:05/29/2024) this should be switched by env var

const SERVER_URL = "https://opentrons-poc-64340737.ap-south-1.elb.amazonaws.com"
// const SERVER_URL = "http://localhost:8000"

export const PROD_END_POINT = SERVER_URL + '/api/chat/completion'
export const PROD_HISTORY_END_POINT = SERVER_URL + '/api/chat/history'
export const PROD_FEEDBACK_END_POINT = SERVER_URL + '/api/chat/feedback'
export const PROD_CREATE_PROTOCOL_END_POINT = SERVER_URL + '/api/chat/createProtocol'
export const PROD_UPDATE_PROTOCOL_END_POINT = SERVER_URL + '/api/chat/updateProtocol'
export const PROD_GET_USER_DETAILS_END_POINT = SERVER_URL + '/api/userinfo'

// auth0 domain
export const AUTH0_DOMAIN = 'dev-6xct6ddhil0ooeri.us.auth0.com'
export const PROD_AUTH0_CLIENT_ID = 'MOTHJrrAyHOZFXtIN7ptzvWUwHemPZjU'
export const PROD_AUTH0_AUDIENCE = 'https://*.arc-saas.net'

// auth0 for local
export const LOCAL_AUTH0_AUDIENCE = 'http://localhost:5173'

export const CLIENT_MAX_WIDTH = '1440px'

export const API_GATEWAY_DOMAIN = "https://h7a82dp9ri.execute-api.ap-south-1.amazonaws.com/dev/users";
export const API_GATEWAY_KEY = "4ZdrnK5j2B4ZbdmD36Bm9KQJ4uxrWrh5ujJrMA1c";
