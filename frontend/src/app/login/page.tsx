import Image from "next/image";
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
      <aside className={styles.visualPanel}>
        <Link href="/" className={styles.brand} aria-label="WayPet Home">
          <svg
            className={styles.brandIcon}
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <ellipse cx="16" cy="21" rx="8" ry="7" />
            <ellipse cx="6" cy="14" rx="3" ry="4" />
            <ellipse cx="26" cy="14" rx="3" ry="4" />
            <ellipse cx="11" cy="7" rx="3" ry="4" />
            <ellipse cx="21" cy="7" rx="3" ry="4" />
          </svg>
          <span>
            WAYPET
            <br />
            HOME
          </span>
        </Link>

        <Image
          src="/images/auth/spiral.png"
          alt=""
          width={450}
          height={338}
          className={styles.spiral}
          priority
        />

        <Image
          src="/images/auth/woman-cat.png"
          alt="Mujer sonriendo mientras abraza a un gato naranja"
          width={618}
          height={875}
          className={styles.hero}
          priority
        />
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <h1>Iniciar Sesión</h1>

          <p className={styles.subtitle}>
            Por favor, introduce tus datos para iniciar sesión en tu cuenta.
          </p>

          {params.registered === "1" && (
            <p className={styles.success} role="status">
              ¡Tu cuenta fue creada exitosamente! Ya puedes iniciar sesión.
            </p>
          )}

          <LoginForm />

          <p className={styles.registerText}>
            ¿No tienes una cuenta? <Link href="/register">Registrarse</Link>
          </p>
        </div>
      </section>
    </main>
  );
}