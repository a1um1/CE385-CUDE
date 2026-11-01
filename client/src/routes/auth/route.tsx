import { resolveSession } from "#/data/user.data";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import styles from "./auth.module.css";
import Logo from "#/components/logo";
import AsciiPanel from "#/routes/auth/-ascii";

const images = [
  {
    src: "/517809ldsdl.jpg",
    name: "Calanques vers Bougie, Algérie",
    author: "Eugène François Deshayes",
  },
  {
    src: "/528152ldsdl.jpg",
    name: "Salzburger Alps - View of the Hoher Göll",
    author: "Toni Haller",
  },
  {
    src: "/50916jpsdl.jpg",
    name: "Fireflies at Ochanomizu",
    author: "Kobayashi Kiyochika",
  },
  {
    src: "/519908ldsdl.jpg",
    name: "The Harbour of Messina with the Shore of Calabria in the Distance",
    author: "Charles Rowbotham",
  },
  {
    src: "/540319ldsdl.jpg",
    name: "A Venetian palace",
    author: "Antonietta Brandeis",
  },
  {
    src: "/508845ldsdl.jpg",
    name: "A Spring Day",
    author: "Fritz Müller-Landeck",
  },
  {
    src: "/552503ldsdl.jpg",
    name: "La Seine à Paris",
    author: "Albert Lebourg",
  },
  {
    src: "/517197ldsdl.jpg",
    name: "Kreuzgang des Augustinerklosters in Landau II",
    author: "Max Slevogt",
  },
  {
    src: "/521731ldsdl.jpg",
    name: "Peasant House at Éragny",
    author: "Camille Pissarro",
  },
  {
    src: "/527687ldsdl.jpg",
    name: "Motiv aus dem Mirabell-Park",
    author: "Luise Begas-Parmentier",
  },
  {
    src: "/543999ldsdl.jpg",
    name: "Camaret. Küste bei Brest",
    author: "Alfred Zoff",
  },
];

const randomImage = images[Math.floor(Math.random() * images.length)] ?? images[0];

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles["hex-bg"]}>
      <AsciiPanel
        src={randomImage?.src ?? ""}
        name={randomImage?.name}
        author={randomImage?.author}
      />
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
