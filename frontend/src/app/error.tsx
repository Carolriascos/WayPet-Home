"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Algo salió mal</h1>
      <p role="alert" className="alert alert-error">
        No pudimos cargar esta pantalla. Revisa tu conexión e intenta de nuevo.
      </p>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}