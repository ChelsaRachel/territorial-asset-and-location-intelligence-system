import { ApiError } from "@/lib/api/common/ApiError";

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "NOT_FOUND";
}

export function errorDescription(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan saat membaca data intelligence.";
}
