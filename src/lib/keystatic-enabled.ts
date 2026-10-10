/** The editor runs locally always; in production only when GitHub mode is fully configured. */
export const keystaticEnabled =
  process.env.NODE_ENV !== "production" ||
  (process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github" &&
    Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET));
