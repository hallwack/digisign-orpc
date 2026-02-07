import { createFileRoute } from "@tanstack/react-router";

import RegisterForm from "./-components/register-form";

export const Route = createFileRoute("/_auth/register")({
  component: AuthRegisterPageComponent,
});

function AuthRegisterPageComponent() {
  return <RegisterForm />;
}
