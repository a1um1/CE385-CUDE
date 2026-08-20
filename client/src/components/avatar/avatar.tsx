import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import avatarStyle from "./avatar.module.css";

export interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
}

export default function Avatar({ name, avatarUrl }: AvatarProps) {
  return (
    <BaseAvatar.Root className={avatarStyle.avatar}>
      {avatarUrl && <BaseAvatar.Image src={avatarUrl} alt={name} className={avatarStyle.image} />}
      <BaseAvatar.Fallback className={avatarStyle.fallback}>
        {name?.[0]?.toUpperCase()}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
