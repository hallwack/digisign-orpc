import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/document/verify")({
  beforeLoad: () => {
    throw Route.redirect({
      to: "/verify",
    });
  },
});
