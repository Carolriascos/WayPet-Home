
import Link from "next/link";
import RegisterForm from "./register-form";
import styles from "./register.module.css";

export default function RegisterPage() {
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

            <h2>¡Únete a nuestra comunidad!</h2>

            <p>
              Ayúdanos a conectar mascotas con sus familias.
              Cada registro es una oportunidad para un reencuentro.
            </p>
          </div>

          <p className={styles.visualFooter}>
            Porque ningún peludito debería estar lejos de casa.
          </p>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formContent}>
            <span className={styles.eyebrow}>WAYPET HOME</span>

            <h1>Crear cuenta</h1>

            <p className={styles.subtitle}>
              Completa tus datos para formar parte de nuestra comunidad.
            </p>

            <RegisterForm />

            <p className={styles.loginText}>
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login">Inicia sesión</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
