export class ApiError extends Error {
  constructor(
    public code: "NOT_YET_AVAILABLE" | "NOT_FOUND" | "FIXTURE_INVALID" | "NETWORK",
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
