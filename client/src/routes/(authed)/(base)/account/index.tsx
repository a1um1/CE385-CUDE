import Avatar from "#/components/avatar";
import ImageUploadField from "#/components/imageUploadField";
import UserBackground from "#/components/userBackground";
import { useUpdateAvatar, useUpdateBackground, useUser } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import { CameraIcon } from "lucide-react";
import styles from "../profile/profile.module.css";

export const Route = createFileRoute("/(authed)/(base)/account/")({
  component: RouteComponent,
  staticData: {
    pageKey: "profile",
    pageTitle: "Profile",
  },
});

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-(--color-border) py-3 last:border-b-0">
      <span className="text-sm opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RouteComponent() {
  const { data: user } = useUser();
  const updateAvatar = useUpdateAvatar();
  const updateBackground = useUpdateBackground();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="relative overflow-hidden rounded-lg">
          <UserBackground
            backgroundUrl={user?.backgroundImage}
            name={user?.name}
            className={styles["background-user-banner"]}
          />
          <ImageUploadField
            purpose="background"
            aspect={32 / 9}
            maxDim={1600}
            targetBytes={400 * 1024}
            value={user?.backgroundImage}
            disabled={updateBackground.isPending}
            onUploaded={async (url) => {
              await updateBackground.mutateAsync({ backgroundImageURL: url });
            }}
            renderTrigger={({ onClick, busy }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={busy}
                aria-label="Change background image"
                className="group absolute inset-0 flex cursor-pointer items-end justify-end p-3"
              >
                <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white opacity-60 transition-opacity group-hover:opacity-100">
                  <CameraIcon size="0.875rem" />
                  Change background
                </span>
              </button>
            )}
          />
        </div>

        <div className="mt-4 flex items-center gap-4 px-4 max-md:flex-col max-md:items-center max-md:text-center">
          <div className="group relative overflow-hidden rounded-full">
            <Avatar avatarUrl={user?.profileImage} name={user?.name} size="8rem" />
            <ImageUploadField
              purpose="avatar"
              aspect={1}
              maxDim={512}
              targetBytes={150 * 1024}
              value={user?.profileImage}
              disabled={updateAvatar.isPending}
              onUploaded={async (url) => {
                await updateAvatar.mutateAsync({ profileImageURL: url });
              }}
              renderTrigger={({ onClick, busy }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={busy}
                  aria-label="Change avatar image"
                  className="absolute inset-0 z-10 cursor-pointer"
                >
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/60 py-2 text-white opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <CameraIcon size="0.75rem" />
                  </span>
                </button>
              )}
            />
          </div>
          <div>
            <span>@{user?.username}</span>
            <h2 className="text-3xl font-semibold">
              {user?.name}{" "}
              {user?.epithet && <span className={styles["epihet"]}>{user.epithet}</span>}
            </h2>
          </div>
        </div>
      </div>

      <section className="flex flex-col">
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Username" value={user?.username && `@${user.username}`} />
        <InfoRow label="Email" value={user?.email} />
      </section>
    </div>
  );
}
