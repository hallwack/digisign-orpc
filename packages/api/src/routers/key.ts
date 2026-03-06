import { protectedProcedure } from "..";

export const keyRouter = {
  getAll: protectedProcedure.route({
    path: "/key",
    method: "GET",
    tags: ["Key"],
    summary: "Get All Keys",
    description: "Retrieve all keys for the authenticated user",
  }),
};
