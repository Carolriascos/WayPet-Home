import Image from "next/image";
import Link from "next/link";
import RegisterForm from "./register-form";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <main className={`auth-page ${styles.page}`}>
      <aside className={styles.visualPanel}>
        <Link href="/" className={styles.brand} aria-label="WayPet Home">
          <Image
            src="/images/auth/logo.png"
            alt="WayPet Home"
            width={165}
            height={42}
            priority
          />
        </Link>

        {/* arco decorativo, tono apenas más oscuro que el fondo */}
        <svg
          className={styles.arc}
          viewBox="0 0 544 360"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path d="M -10 120 C 110 175 300 170 350 20" />
        </svg>

        <Image
          src="/images/auth/burst.png"
          alt=""
          width={230}
          height={219}
          className={styles.burst}
          priority
        />

        <Image
          src="/images/auth/man-dog.png"
          alt="Hombre sonriendo mientras abraza a un cachorro golden retriever"
          width={655}
          height={921}
          className={styles.hero}
          priority
        />
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.formContent}>
          <h1>Registrarse</h1>

          <p className={styles.subtitle}>
            Por favor, introduce tus datos para registrarse y crear una cuenta.
          </p>

          <RegisterForm />

          <p className={styles.loginText}>
            Ya tienes cuenta <Link href="/login">Iniciar Sesión</Link>
          </p>
        </div>
      </section>
    </main>
  );
}