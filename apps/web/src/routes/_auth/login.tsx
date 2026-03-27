import { createFileRoute } from "@tanstack/react-router";

import LoginForm from "./-components/login-form";

export const Route = createFileRoute("/_auth/login")({
  component: AuthLoginPageComponent,
  staticData: {
    breadcrumb: { label: "Login" },
  },
});

function AuthLoginPageComponent() {
  return <LoginForm />;
}
