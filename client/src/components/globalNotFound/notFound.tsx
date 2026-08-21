import ButtonLink from "#/components/buttonLink";
import style from "./notFound.module.css";

export default function NotFound() {
  return (
    <div className={style["not-found"]}>
      <h1 className={style["not-found-title"]}>404</h1>
      <p className={style["not-found-message"]}>Page not found</p>
      <ButtonLink to="/">Go to Home</ButtonLink>
    </div>
  );
}
