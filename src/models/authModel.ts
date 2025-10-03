import { Request } from "express";

export interface IAuthRequest extends Request {
  user?: { user_id: string; email: string };
}

export enum AuthResponseMsgEnum {
  MISSING_REQUIRED_FIELDS = "Required fields are missing",
  MISSING_ACCESS_TOKEN = "Access token is missing",
  MISSING_REFRESH_TOKEN = "Refresh token is missing",
  INVALID_ACCESS_TOKEN = "Invalid access token",
  REFRESH_TOKEN_NOT_FOUND = "Refresh token not found",
  SERVER_ERROR = "Oops! Server error. Please try again later.",
  INVALID_CREDNTIALS = "Invalid credentials",
  USER_NOT_FOUND = "User not found",
  EMAIL_ALREADY_EXISTS = "User with this Email already exists",
  PROFILE_ALREADY_EXISTS = "User with this Profile name already exists",
  PROFILE_UPDATE_FIELD_MISSING = "User ID or Profile name is missing",
  PROFILE_UPDATED_SUCCESSFULLY = "Profile updated successfully",
}