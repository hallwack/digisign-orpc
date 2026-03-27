import { Outlet, createFileRoute } from "@tanstack/react-router";

import FooterSection from "./-component/footer-section";
import HeaderSection from "./-component/header-section";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  staticData: {
    breadcrumb: { label: "Beranda" },
  },
});

function RouteComponent() {
  return (
    <>
      <HeaderSection />
      <Outlet />
      <FooterSection />
    </>
  );
}
