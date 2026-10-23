import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useAdminDeactivateUser,
  useAdminActivateUser,
  useAdminUpdateUser,
  getAdminUserQueryOptions,
  useGetAdminUser,
} from "#/data/admin/user.data";
import { useQueryClient } from "@tanstack/react-query";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import Input from "#/components/input";
import Avatar from "#/components/avatar";
import UserBackground from "#/components/userBackground";
import ImageUploadField from "#/components/imageUploadField";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import ChangePasswordDialog from "#/routes/admin/user/-dialog/changePasswordDialog";
import { CameraIcon, ExternalLinkIcon } from "lucide-react";
import styles from "./userEdit.module.css";

export const Route = createFileRoute("/admin/user/$id")({
  component: RouteComponent,
  staticData: {
    pageKey: "admin-user-detail",
    pageTitle: "Edit User",
  },
  loader: async ({ params, context }) => {
    const user = await context.queryClient.query(getAdminUserQueryOptions(params.id));
    return user;
  },
});

function UserField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? "—"}</span>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const initialData = Route.useLoaderData();
  const { data: user = initialData } = useGetAdminUser(id);

  const [name, setName] = useState(user.name);
  const [epithet, setEpithet] = useState(user.epithet ?? "");

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { mutateAsync: deactivate, isPending: isDeactivating } = useAdminDeactivateUser();
  const { mutateAsync: activate, isPending: isActivating } = useAdminActivateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useAdminUpdateUser();

  const handleDeactivate = async () => {
    await deactivate({ id });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", id] });
    setDeactivateOpen(false);
  };

  const handleActivate = async () => {
    await activate({ id });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", id] });
    setActivateOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      id,
      name,
      epithet: epithet.trim() || null,
    });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", id] });
  };

  const handleUpdateAvatar = async (url: string) => {
    await updateUser({
      id,
      profileImage: url,
    });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", id] });
  };

  const handleUpdateBackground = async (url: string) => {
    await updateUser({
      id,
      backgroundImage: url,
    });
    await queryClient.invalidateQueries({ queryKey: ["admin", "user", "info", id] });
  };

  const hasProfileChanges = name !== user.name || epithet !== (user.epithet ?? "");

  return (
    <div className={styles.container}>
      {/* Banner */}
      <div className={styles.banner}>
        <UserBackground
          backgroundUrl={user.backgroundImage}
          name={user.name}
          className="w-full h-48 rounded-lg object-cover"
        />
        <ImageUploadField
          purpose="background"
          aspect={32 / 9}
          maxDim={1600}
          targetBytes={400 * 1024}
          value={user.backgroundImage}
          disabled={isUpdating}
          onUploaded={handleUpdateBackground}
          renderTrigger={({ onClick, busy }) => (
            <button
              type="button"
              onClick={onClick}
              disabled={busy}
              aria-label="Change background banner"
              className={styles.bannerTrigger}
            >
              <span className={styles.bannerBadge}>
                <CameraIcon size="0.875rem" />
                Change banner
              </span>
            </button>
          )}
        />
      </div>

      {/* Profile info row */}
      <div className={styles.profileRow}>
        <div className={styles.profileInfo}>
          <div className={styles.avatarWrapper}>
            <Avatar avatarUrl={user.profileImage} name={user.name} size="6rem" />
            <ImageUploadField
              purpose="avatar"
              aspect={1}
              maxDim={512}
              targetBytes={150 * 1024}
              value={user.profileImage}
              disabled={isUpdating}
              onUploaded={handleUpdateAvatar}
              renderTrigger={({ onClick, busy }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={busy}
                  aria-label="Change avatar"
                  className={styles.avatarTrigger}
                >
                  <span className={styles.avatarBadge}>
                    <CameraIcon size="0.75rem" />
                  </span>
                </button>
              )}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {user.name}
              {user.epithet && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                  {user.epithet}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <ButtonLink
            to="/profile/$username"
            params={{ username: user.username }}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="ghost"
          >
            <ExternalLinkIcon size="0.875rem" />
            View Profile
          </ButtonLink>
          {user.isActive ? (
            <Button size="sm" variant="danger" onClick={() => setDeactivateOpen(true)}>
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

      {/* Editable form fields */}
      <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="user-name" className={styles.label}>
              Name
            </label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="user-epithet" className={styles.label}>
              Epithet
            </label>
            <Input
              id="user-epithet"
              value={epithet}
              onChange={(e) => setEpithet(e.target.value)}
              placeholder="e.g. The Brave"
            />
          </div>
        </div>

        <div>
          <Button type="submit" size="sm" disabled={!hasProfileChanges || isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Read-only metadata fields */}
      <div className={styles.formGrid}>
        <UserField label="ID" value={user.id} />
        <UserField label="Email" value={user.email} />
        <UserField label="Role" value={user.role} />
        <UserField label="Status" value={user.isActive ? "Active" : "Inactive"} />
        <UserField label="Created At" value={new Date(user.createdAt).toLocaleString()} />
        <UserField label="Updated At" value={new Date(user.updatedAt).toLocaleString()} />
        {user.deactivateReason && (
          <div className="col-span-full flex flex-col gap-1">
            <span className={styles.label}>Deactivation Reason</span>
            <span className="text-red-500 font-medium">{user.deactivateReason}</span>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${user.name}? They will lose access to the platform.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDeactivate}
        isPending={isDeactivating}
      />

      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Activate User"
        description={`Are you sure you want to re-activate ${user.name}?`}
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
