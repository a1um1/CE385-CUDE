import logoStyle from "./logo.module.css";

export interface LogoProps {
  type?: "normal" | "admin";
}

export default function Logo({ type = "normal" }: LogoProps) {
  if (type === "admin") {
    return (
      <div className={logoStyle.logo}>
        CUDE <span>Admin</span>
      </div>
    );
  }
  return <div className={logoStyle.logo}>CUDE</div>;
}
