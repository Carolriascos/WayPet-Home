import Link from "next/link";
import type { ReactNode } from "react";
import type { Report } from "@/types/report";
import "./ui.css";

type Tone = "danger" | "success" | "warning" | "neutral";

export function StatusTag({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`tag tag-${tone}`}>{label}</span>;
}

export function ReportTypeTag({ type }: { type: Report["type"] }) {
  return (
    <StatusTag
      label={type === "perdida" ? "Perdido" : "Encontrado"}
      tone={type === "perdida" ? "danger" : "success"}
    />
  );
}

export function SimilarityBar({ value }: { value: number }) {
  const level =
    value >= 80 ? "Alta compatibilidad" : value >= 60 ? "Compatibilidad media" : "Compatibilidad baja";

  return (
    <div className="similarity">
      <p className="similarity-value">{value}%</p>
      <div
        className="similarity-track"
        role="progressbar"
        aria-label="Similitud estimada"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="similarity-fill" style={{ width: `${value}%` }} />
      </div>
      <p className="muted">{level}</p>
    </div>
  );
}

type FilterOption = { label: string; href: string; active: boolean };

export function FilterLinks({ options, label }: { options: FilterOption[]; label: string }) {
  return (
    <nav className="filters" aria-label={label}>
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          aria-current={option.active ? "page" : undefined}
          className={option.active ? "filter filter-active" : "filter"}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="empty-state">{message}</p>;
}

export function AlertMessage({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "info";
}) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`alert alert-${tone}`}>
      {message}
    </p>
  );
}

export function PetCard({ report, children }: { report: Report; children?: ReactNode }) {
  const { pet } = report;

  return (
    <article className="pet-card">
      <div className="pet-card-photo">
        {pet.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.photoUrl} alt={pet.name ?? pet.breed} />
        ) : (
          <span aria-hidden="true">🐾</span>
        )}
        <ReportTypeTag type={report.type} />
      </div>
      <h3>{pet.name ?? pet.breed}</h3>
      <p className="muted">{report.location}</p>
      <p className="chips">
        {[pet.breed, pet.sex, pet.size, pet.color].map((value) => (
          <span key={value} className="chip">{value}</span>
        ))}
      </p>
      {children}
    </article>
  );
}