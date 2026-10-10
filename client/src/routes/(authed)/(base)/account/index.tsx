import Avatar from "#/components/avatar";
import ImageUploadField from "#/components/imageUploadField";
import UserBackground from "#/components/userBackground";
import { useUpdateAvatar, useUpdateBackground, useUser } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import { CameraIcon } from "lucide-react";
import accountStyles from "./account.module.css";
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
    <div className={accountStyles["info-row"]}>
      <span className={accountStyles["info-label"]}>{label}</span>
      <span className={accountStyles["info-value"]}>{value}</span>
    </div>
  );
}

function RouteComponent() {
  const { data: user } = useUser();
  const updateAvatar = useUpdateAvatar();
  const updateBackground = useUpdateBackground();

  return (
    <div className={accountStyles.page}>
      <div>
        <div className={accountStyles.banner}>
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
                className={accountStyles["banner-trigger"]}
              >
                <span className={accountStyles["banner-badge"]}>
                  <CameraIcon size="0.875rem" />
                  Change background
                </span>
              </button>
            )}
          />
        </div>

        <div className={accountStyles["profile-row"]}>
          <div className={accountStyles.avatar}>
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
                  className={accountStyles["avatar-trigger"]}
                >
                  <span className={accountStyles["avatar-badge"]}>
                    <CameraIcon size="0.75rem" />
                  </span>
                </button>
              )}
            />
          </div>
          <div>
            <span>@{user?.username}</span>
            <h2 className={styles["page-title"]}>
              {user?.name}{" "}
              {user?.epithet && <span className={styles["epihet"]}>{user.epithet}</span>}
            </h2>
          </div>
        </div>
      </div>

      <section className={accountStyles.details}>
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Username" value={user?.username && `@${user.username}`} />
        <InfoRow label="Email" value={user?.email} />
      </section>
    </div>
  );
}
