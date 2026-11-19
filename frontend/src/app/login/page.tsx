
import Link from "next/link";
import LoginForm from "./login-form";
import styles from "./login.module.css";

type LoginPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className={`auth-page ${styles.page}`}>
      <section className={styles.card}>
        <aside className={styles.visualPanel}>
          <Link href="/" className={styles.brand}>
            WayPet <span>Home</span>
          </Link>

          <div className={styles.visualContent}>
            <div className={styles.pawCircle} aria-hidden="true">
              🐾
            </div>
            <h2>¡Bienvenido de nuevo!</h2>
            <p>
              Cada mascota merece volver a casa.
              Estamos aquí para ayudar a reunir historias.
            </p>
          </div>

          <p className={styles.visualFooter}>
            Juntos hacemos posible el reencuentro.
          </p>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formContent}>
            <span className={styles.eyebrow}>WAYPET HOME</span>

            <h1>Iniciar sesión</h1>

            <p className={styles.subtitle}>
              Ingresa tus datos para continuar.
            </p>

            {params.registered === "1" && (
              <p className={styles.success} role="status">
                ¡Tu cuenta fue creada exitosamente! Ya puedes iniciar sesión.
              </p>
            )}

            <LoginForm />

            <p className={styles.registerText}>
              ¿No tienes una cuenta?{" "}
              <Link href="/register">Regístrate aquí</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
