import Link from "next/link";
import { EmptyState } from "@/components/ui/ui";

export default function CaseNotFound() {
  return (
    <main>
      <h1>Caso no encontrado</h1>
      <EmptyState message="Este caso no existe o fue eliminado." />
      <p>
        <Link href="/">Volver a casos</Link>
      </p>
    </main>
  );
}