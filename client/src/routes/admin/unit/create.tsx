import UnitForm from "./-form/unitForm";
import { useAdminCreateUnit } from "#/data/admin/unit.data";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const createUnitSearchSchema = z.object({
  courseID: z.string().optional(),
});

export const Route = createFileRoute("/admin/unit/create")({
  validateSearch: (search) => createUnitSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Create Unit",
    pageKey: "admin-unit-create",
  },
});

function RouteComponent() {
  const { courseID } = Route.useSearch();
  const navigate = Route.useNavigate();
  const createMutation = useAdminCreateUnit();

  return (
    <UnitForm
      defaultValues={{
        name: "",
        courseID: courseID ?? "",
      }}
      submitLabel="Create"
      onSubmit={async (value) => {
        await createMutation.mutateAsync(value);
        navigate({
          to: "/admin/unit",
          search: {
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            courseID: value.courseID,
          },
        });
      }}
    />
  );
}
