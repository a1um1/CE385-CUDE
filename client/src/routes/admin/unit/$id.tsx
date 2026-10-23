import UnitForm from "./-form/unitForm";
import { useAdminUpdateUnit, getAdminUnitQueryOptions } from "#/data/admin/unit.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/unit/$id")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Edit Unit",
    pageKey: "admin-unit-edit",
  },
  loader: async ({ params, context }) => {
    const unit = await context.queryClient.query(getAdminUnitQueryOptions(params.id));
    return unit;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const updateMutation = useAdminUpdateUnit();
  const data = Route.useLoaderData();

  return (
    <UnitForm
      key={data.id}
      defaultValues={{
        name: data.name,
        courseID: data.courseID,
      }}
      isEdit
      submitLabel="Save Changes"
      isPending={updateMutation.isPending}
      onSubmit={async (value) => {
        await updateMutation.mutateAsync({
          id,
          body: {
            name: value.name,
          },
        });
        navigate({
          to: "/admin/unit",
          search: {
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            courseID: data.courseID,
          },
        });
      }}
    />
  );
}
