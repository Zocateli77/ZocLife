export const SESSION_COOKIE_NAME = "zoc_life_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const DEFAULT_USER_ID =
  process.env.APP_USER_ID ?? "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export const PUBLIC_ROUTES = ["/login"];
export const AUTH_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/automation/daily-briefing",
];
