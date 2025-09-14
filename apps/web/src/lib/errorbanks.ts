export enum ErrorCode {
    INVALID_CREDENTIALS = "invalid_credentials",
    INVALID_RESPONSE = "invalid_response",
    MISSING_CREDENTIALS = "missing_credentials",
}

export const errorMessages: Record<ErrorCode, string> = {
    [ErrorCode.INVALID_CREDENTIALS]: "Invalid credentials",
    [ErrorCode.INVALID_RESPONSE]: "Invalid response",
    [ErrorCode.MISSING_CREDENTIALS]: "Missing credentials",

}

