import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/key/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/key/create"!</div>
}
