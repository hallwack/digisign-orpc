import { createFileRoute } from "@tanstack/react-router";

import CTASection from "./-component/cta-section";
import FeaturesSection from "./-component/features-section";
import HeroSection from "./-component/hero-section";
import SigningWorkflowSection from "./-component/signing-workflow-section";

export const Route = createFileRoute("/(app)/")({
  component: HomePageComponent,
  staticData: {
    breadcrumb: { label: "Beranda" },
  },
  head: () => ({
    meta: [
      { title: "Veridoc" },
      {
        name: "description",
        content: "Verifikasi dokumen Anda",
      },
    ],
  }),
});

function HomePageComponent() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SigningWorkflowSection />
      <CTASection />
    </>
  );
}
