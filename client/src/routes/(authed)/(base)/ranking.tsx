import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authed)/(base)/ranking')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authed)/(base)/ranking"!</div>
}
