
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  createClueAction,
  type ClueFormState,
} from "@/app/actions/clues";
import type { Report } from "@/types/report";
import styles from "./page.module.css";

const initialState: ClueFormState = {
  error: "",
  values: {},
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function CreateClueForm({
  reports,
}: {
  reports: Report[];
}) {
  const [state, formAction, isPending] = useActionState(
    createClueAction,
    initialState
  );

  const [selectedReportId, setSelectedReportId] = useState(
    state.values.reportId ?? String(reports[0]?.id ?? "")
  );

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }

    const imageUrl = URL.createObjectURL(photo);
    setPhotoPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [photo]);

  const selectedReport = reports.find(
    (report) => String(report.id) === selectedReportId
  );

  function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.currentTarget.files?.[0] ?? null;

    if (!file) {
      setPhoto(null);
      setPhotoError("");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      event.currentTarget.value = "";
      setPhoto(null);
      setPhotoError("Selecciona una imagen JPG, PNG, WEBP o GIF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      event.currentTarget.value = "";
      setPhoto(null);
      setPhotoError("La imagen no puede superar los 5 MB.");
      return;
    }

    setPhoto(file);
    setPhotoError("");
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoError("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  if (reports.length === 0) {
    return (
      <section className={styles.formCard}>
        <h2>No hay reportes disponibles</h2>
        <p>
          Para registrar un avistamiento primero debe existir
          un reporte de una mascota.
        </p>
        <Link href="/reportar">Crear un reporte</Link>
      </section>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <section className={styles.formCard}>
        <h2>Selecciona el reporte relacionado</h2>
        <p>
          Elige la mascota que viste para asociar tu avistamiento.
        </p>

        <label className={styles.field}>
          <span>Reporte de la mascota</span>

          <select
            name="reportId"
            value={selectedReportId}
            onChange={(event) =>
              setSelectedReportId(event.target.value)
            }
            required
          >
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.pet.name ?? report.pet.breed} - {report.location}
              </option>
            ))}
          </select>
        </label>

        {selectedReport && (
          <div className={styles.selectedReport}>
            {selectedReport.pet.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedReport.pet.photoUrl}
                alt={selectedReport.pet.name ?? selectedReport.pet.breed}
              />
            ) : (
              <div className={styles.petPlaceholder}>🐾</div>
            )}

            <div>
              <strong>
                {selectedReport.pet.name ?? selectedReport.pet.breed}
              </strong>
              <p>Reporte: {selectedReport.type}</p>
              <p>Ubicación: {selectedReport.location}</p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.formCard}>
        <h2>Información del avistamiento</h2>
        <p>
          Cuéntanos dónde y cuándo viste a la mascota.
        </p>

        <div className={styles.twoCols}>
          <label className={styles.field}>
            <span>Fecha y hora</span>
            <input
              type="datetime-local"
              name="sightedAt"
              defaultValue={state.values.sightedAt ?? ""}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Ubicación</span>
            <input
              type="text"
              name="location"
              placeholder="Barrio, dirección o lugar..."
              defaultValue={state.values.location ?? ""}
              minLength={3}
              maxLength={200}
              required
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>Descripción del avistamiento</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Cuéntanos qué viste y cualquier detalle adicional. Entre más detalles, más fácil será encontrar la mascota..."
            defaultValue={state.values.description ?? ""}
            minLength={10}
            maxLength={500}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Fotografía del avistamiento (opcional)</span>

          <input
            ref={photoInputRef}
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePhotoChange}
          />

          <small>
            Selecciona una fotografía desde tu dispositivo.
            Formatos JPG, PNG, WEBP o GIF. Máximo 5 MB.
          </small>
        </label>

        {photoError && (
          <p className={styles.error} role="alert">
            {photoError}
          </p>
        )}

        {photoPreview && (
          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <strong>Vista previa de la fotografía</strong>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Vista previa del avistamiento"
              style={{
                width: "100%",
                maxWidth: "350px",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              }}
            />

            <button
              type="button"
              onClick={removePhoto}
              style={{
                justifySelf: "start",
                background: "#e54848",
              }}
            >
              Quitar fotografía
            </button>
          </div>
        )}
      </section>

      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isPending || !!photoError}
      >
        {isPending ? "Enviando avistamiento..." : "Enviar avistamiento"}
      </button>
    </form>
  );
}
