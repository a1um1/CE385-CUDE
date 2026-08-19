import avatarStyle from "./avatar.module.css";

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
}

export default function Avatar({ name, avatarUrl }: AvatarProps) {
  return (
    <div className={avatarStyle.avatar} data-initial={name?.[0]?.toUpperCase()}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.className = avatarStyle.error || "";
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}
