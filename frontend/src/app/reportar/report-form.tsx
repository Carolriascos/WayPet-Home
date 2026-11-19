"use client";

import { useActionState } from "react";
import { createReportAction, type ReportFormState } from "@/app/actions/reports";
import { SEX_OPTIONS, SIZE_OPTIONS } from "@/lib/report-options";

const initialState: ReportFormState = { error: "", values: {} };

export default function ReportForm({ today }: { today: string }) {
  const [state, formAction, isPending] = useActionState(createReportAction, initialState);
  const v = state.values;

  return (
    <form action={formAction} className="form">
      <label className="field">
        <span>Tipo de reporte</span>
        <select name="type" defaultValue={v.type ?? "perdida"} required>
          <option value="perdida">Mascota perdida</option>
          <option value="encontrada">Mascota encontrada</option>
        </select>
      </label>

      <div className="two-cols">
        <label className="field">
          <span>Especie</span>
          <input name="species" defaultValue={v.species} placeholder="Perro, gato…" maxLength={50} required />
        </label>
        <label className="field">
          <span>Nombre (opcional)</span>
          <input name="petName" defaultValue={v.petName} maxLength={100} />
        </label>
      </div>

      <div className="two-cols">
        <label className="field">
          <span>Raza</span>
          <input name="breed" defaultValue={v.breed} placeholder="Labrador, criolla…" maxLength={100} required />
        </label>
        <label className="field">
          <span>Color</span>
          <input name="color" defaultValue={v.color} maxLength={50} required />
        </label>
      </div>

      <div className="two-cols">
        <label className="field">
          <span>Sexo</span>
          <select name="sex" defaultValue={v.sex ?? ""} required>
            <option value="" disabled>Selecciona…</option>
            {SEX_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tamaño</span>
          <select name="size" defaultValue={v.size ?? ""} required>
            <option value="" disabled>Selecciona…</option>
            {SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Señas particulares (opcional)</span>
        <input name="signs" defaultValue={v.signs} placeholder="Collar azul, mancha en el ojo…" maxLength={200} />
      </label>

      <label className="field">
        <span>Descripción</span>
        <textarea name="description" defaultValue={v.description} rows={4} required />
      </label>

      <div className="two-cols">
        <label className="field">
          <span>Ubicación</span>
          <input name="location" defaultValue={v.location} placeholder="Barrio o dirección" maxLength={200} required />
        </label>
        <label className="field">
          <span>Fecha</span>
          <input type="date" name="eventDate" defaultValue={v.eventDate} max={today} required />
        </label>
      </div>

      <label className="field">
        <span>URL de la foto (opcional)</span>
        <input type="url" name="photoUrl" defaultValue={v.photoUrl} placeholder="https://…" maxLength={300} />
      </label>

      {state.error && (
        <p className="alert alert-error" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Enviando…" : "Publicar reporte"}
      </button>
    </form>
  );
}