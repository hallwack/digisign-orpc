import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const base = os.$context<Context>();

export const publicProcedure = base;

const requireAuth = base.middleware(async ({ context, next }) => {
  const isAuthed = !!context.session?.user;
  if (!isAuthed) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
