import { createFileRoute, useMatches } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/(app)/verify")({
  component: VerifyPageComponent,
  staticData: {
    breadcrumb: { label: "verify" },
  },
});

function VerifyPageComponent() {
  const matches = useMatches();
  console.log("Matches:", matches);
  return (
    <main className="mx-auto min-h-screen max-w-300 px-4 pt-16 pb-20 sm:px-6">
      <Card>
        <CardContent></CardContent>
      </Card>
    </main>
  );
}
