import { ORPCError, os } from "@orpc/server";

import {
  DrizzleError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@digisign/db/libs/errors";

export const errorHandlerMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ORPCError) throw error;

    if (error instanceof NotFoundError)
      throw new ORPCError("NOT_FOUND", {
        message: error.name,
        data: {
          description: error.message,
        },
      });

    if (error instanceof UnauthorizedError)
      throw new ORPCError("UNAUTHORIZED", {
        message: error.name,
        data: {
          description: error.message,
        },
      });

    if (error instanceof ValidationError)
      throw new ORPCError("BAD_REQUEST", {
        message: error.name,
        data: {
          description: error.message,
        },
      });

    if (error instanceof InternalError)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: error.name,
        data: {
          description: error.message,
        },
      });

    if (error instanceof DrizzleError)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Database error occurred",
        data: {
          description: error.message,
        },
      });

    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "An unexpected error occurred",
    });
  }
});
