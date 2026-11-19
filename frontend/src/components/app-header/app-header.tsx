import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AppHeaderProps = {
  user: { id: number; email: string; role: string } | null;
  unreadCount?: number;
};

async function logout() {
  "use server";
  (await cookies()).delete("waypet_token");
  redirect("/login");
}

export default function AppHeader({ user, unreadCount = 0 }: AppHeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" className="brand">WayPet Home</Link>
      {user ? (
        <>
          <nav className="site-nav" aria-label="Navegación principal">
            <Link href="/">Casos</Link>
            <Link href="/reportar">Reportar</Link>
            <Link href="/mis-reportes">Mis reportes</Link>
            <Link href="/coincidencias">Coincidencias</Link>
            <Link href="/avistamientos">Avistamientos</Link>
            <Link href="/avisos">
              Avisos
              {unreadCount > 0 && (
                <span className="badge" aria-label={`${unreadCount} avisos sin leer`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            {user.role === "administrador" && <Link href="/admin">Admin</Link>}
          </nav>
          <form action={logout}>
            <button type="submit" className="btn-link">Salir</button>
          </form>
        </>
      ) : (
        <Link href="/login">Iniciar sesión</Link>
      )}
    </header>
  );
}