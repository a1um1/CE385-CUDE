import type { SVGProps } from "react";

/** Source: https://svgl.app/library/kotlin.svg */
export default function KotlinIcon({
  className,
  width = 16,
  height = 16,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 256 256"
      preserveAspectRatio="xMidYMid"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient x1="99.991%" y1="-.011%" x2=".01%" y2="100.01%" id="kotlin-a">
          <stop stopColor="#E44857" offset=".344%" />
          <stop stopColor="#C711E1" offset="46.89%" />
          <stop stopColor="#7F52FF" offset="100%" />
        </linearGradient>
      </defs>
      <path fill="url(#kotlin-a)" d="M256 256H0V0h256L128 127.949z" />
    </svg>
  );
}
