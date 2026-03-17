export type AsyncState = "idle" | "loading" | "success" | "error";

const statusMap: Record<string, AsyncState> = {
  pending: "loading",
  success: "success",
  error: "error",
  idle: "idle",
};
export function toAsyncState(status: string): AsyncState {
  return statusMap[status] ?? "idle";
}
