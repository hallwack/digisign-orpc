import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";
import { errorHandlerMiddleware } from "./middlewares/error";

export const base = os.$context<Context>();

export const publicProcedure = base.use(errorHandlerMiddleware);

const requireAuth = base.middleware(async ({ context, next }) => {
  const isAuthed = !!context.session?.user;
  if (!isAuthed) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session as NonNullable<typeof context.session>,
    },
  });
});

export const protectedProcedure = publicProcedure.use(errorHandlerMiddleware).use(requireAuth);
