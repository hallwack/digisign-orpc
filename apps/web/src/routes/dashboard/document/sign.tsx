import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/document/sign')({
  component: DashboardDocumentSignPageComponent,
})

function DashboardDocumentSignPageComponent() {
  return <div>Hello "/dashboard/document/sign"!</div>
}
