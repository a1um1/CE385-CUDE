import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useGetAdminUser,
  useAdminDeactivateUser,
  useAdminActivateUser,
} from "#/data/admin/user.data";
import { useQueryClient } from "@tanstack/react-query";
import Button from "#/components/button";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import ChangePasswordDialog from "#/routes/admin/user/-dialog/changePasswordDialog";

export const Route = createFileRoute("/admin/user/$id")({
  component: RouteComponent,
  staticData: {
    pageKey: "admin-user-detail",
    pageTitle: "Edit User",
  },
});

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "color-mix(in oklch, var(--color-background-text) 60%, transparent)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const valueStyle: React.CSSProperties = {
  fontSize: "1rem",
  color: "var(--color-background-text)",
};

function UserField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={fieldStyle}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value ?? "—"}</span>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAdminUser({ id });

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { mutateAsync: deactivate, isPending: isDeactivating } = useAdminDeactivateUser();
  const { mutateAsync: activate, isPending: isActivating } = useAdminActivateUser();

  const handleDeactivate = async () => {
    await deactivate({ id });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", { id }] });
    setDeactivateOpen(false);
  };

  const handleActivate = async () => {
    await activate({ id });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", { id }] });
    setActivateOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>User not found.</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>{data.name}</h1>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.875rem",
              color: "color-mix(in oklch, var(--color-background-text) 60%, transparent)",
            }}
          >
            {data.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {data.isActive ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setDeactivateOpen(true)}
              style={{ backgroundColor: "var(--color-danger)", color: "var(--color-danger-text)" }}
            >
              Deactivate
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setActivateOpen(true)}>
              Activate
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>
        </div>
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          padding: "1.5rem",
          border: "1px solid var(--color-border)",
          borderRadius: "calc(var(--radius) * 2)",
        }}
      >
        <UserField label="ID" value={data.id} />
        <UserField label="Role" value={data.role} />
        <UserField label="Epithet" value={data.epithet} />
        <UserField label="Status" value={data.isActive ? "Active" : "Inactive"} />
        <UserField label="Created At" value={new Date(data.createdAt).toLocaleString()} />
        <UserField label="Updated At" value={new Date(data.updatedAt).toLocaleString()} />
        {data.deactivateReason && (
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <span style={labelStyle}>Deactivation Reason</span>
            <span style={{ ...valueStyle, color: "var(--color-danger)" }}>
              {data.deactivateReason}
            </span>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${data.name}? They will lose access to the platform.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDeactivate}
        isPending={isDeactivating}
      />

      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Activate User"
        description={`Are you sure you want to re-activate ${data.name}?`}
        confirmLabel="Activate"
        onConfirm={handleActivate}
        isPending={isActivating}
      />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        userId={id}
      />
    </div>
  );
}
