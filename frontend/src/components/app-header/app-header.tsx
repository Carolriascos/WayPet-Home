import Image from "next/image";
import Link from "next/link";

type AppHeaderProps = {
  user: { id: number; email: string; role: string } | null;
  unreadCount?: number;
};

export default function AppHeader({ user, unreadCount = 0 }: AppHeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="WayPet Home">
        <Image src="/images/logo.png" alt="WayPet Home" width={165} height={42} priority />
      </Link>
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
          <div className="header-actions">
            <form action="/" method="get" role="search" className="header-search">
              <input
                type="search"
                name="q"
                placeholder="Buscar"
                aria-label="Buscar casos"
                autoComplete="off"
              />
              <button type="submit" aria-label="Buscar">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" />
                  <path d="m18 18-3.5-3.5" />
                </svg>
              </button>
            </form>
            <Link href="/perfil" className="header-avatar" aria-label="Ir a mi perfil">
              <Image src="/images/avatar.png" alt="" width={68} height={68} />
            </Link>
          </div>
        </>
      ) : (
        <Link href="/login">Iniciar sesión</Link>
      )}
    </header>
  );
}

