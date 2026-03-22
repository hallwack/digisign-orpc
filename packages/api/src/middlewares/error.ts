import { ORPCError, os } from "@orpc/server";

export const errorHandlerMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ORPCError) throw error;

    throw new ORPCError("BAD_REQUEST", {
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
});
