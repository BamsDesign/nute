"use client";

import { useState } from "react";
import { MediaLibraryModal, type MediaItem } from "./MediaLibrary";

export function ImageField({ name, altName, label, defaultUrl, defaultAlt, error, altError }: { name: string; altName?: string; label: string; defaultUrl: string; defaultAlt?: string; error?: string; altError?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [open, setOpen] = useState(false);
  return (
    <div className="a-field a-field--full">
      <span>{label}</span>
      <div className="a-image-field">
        <div className="a-image-field__preview">{url ? url.match(/\.(mp4|webm)$/) ? <span className="a-hint">Vidéo</span> : <img src={url} alt="" /> : <span className="a-hint">Aucune image</span>}</div>
        <div className="a-image-field__controls">
          <input type="hidden" name={name} value={url} />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="a-btn" onClick={() => setOpen(true)}>
              {url ? "Remplacer" : "Choisir une image"}
            </button>
            {url && (
              <button type="button" className="a-btn a-btn--ghost" onClick={() => setUrl("")}>
                Retirer
              </button>
            )}
          </div>
          {altName && (
            <label className="a-field">
              <span>Texte alternatif (description de l&apos;image)</span>
              <input className="a-input" name={altName} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} placeholder="Ex. : Technicien NUTE installant une antenne Starlink sur un toit" aria-invalid={altError ? true : undefined} />
              {altError && <em className="a-error">{altError}</em>}
            </label>
          )}
          {error && <em className="a-error">{error}</em>}
        </div>
      </div>
      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={([m]) => {
          setUrl(m.url);
          if (!alt && m.alt) setAlt(m.alt);
          setOpen(false);
        }}
      />
    </div>
  );
}

type GItem = { mediaId: string; kind: string; caption: string; url: string; thumbUrl: string | null; alt: string; mimeType: string };

export function GalleryField({ label, defaultItems, kinds, error }: { label: string; defaultItems: GItem[]; kinds?: boolean; error?: string }) {
  const [items, setItems] = useState<GItem[]>(defaultItems);
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) =>
    setItems((arr) => {
      const j = i + d;
      if (j < 0 || j >= arr.length) return arr;
      const c = [...arr];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const update = (i: number, patch: Partial<GItem>) => setItems((arr) => arr.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  return (
    <div className="a-field a-field--full">
      <span>{label}</span>
      <input type="hidden" name="__gallery" value={JSON.stringify(items.map(({ mediaId, kind, caption }) => ({ mediaId, kind, caption })))} />
      {items.length > 0 && (
        <ul className="a-gallery-list">
          {items.map((g, i) => (
            <li key={`${g.mediaId}-${i}`}>
              {g.mimeType.startsWith("image/") ? <img src={g.thumbUrl ?? g.url} alt="" /> : <span className="a-media-tile__file">VIDÉO</span>}
              <div className="a-gallery-list__fields">
                <input className="a-input" placeholder="Légende (facultatif)" value={g.caption} maxLength={300} onChange={(e) => update(i, { caption: e.target.value })} aria-label="Légende" />
                {kinds && (
                  <select className="a-input" value={g.kind} onChange={(e) => update(i, { kind: e.target.value })} aria-label="Type de photo">
                    <option value="GALLERY">Galerie</option>
                    <option value="BEFORE">Avant</option>
                    <option value="AFTER">Après</option>
                  </select>
                )}
                {!g.alt && <em className="a-hint">⚠ Ce média n&apos;a pas de description : complétez-la dans la médiathèque.</em>}
              </div>
              <div className="a-gallery-list__actions">
                <button type="button" className="a-btn a-btn--ghost" onClick={() => move(i, -1)} aria-label="Monter" disabled={i === 0}>
                  ↑
                </button>
                <button type="button" className="a-btn a-btn--ghost" onClick={() => move(i, 1)} aria-label="Descendre" disabled={i === items.length - 1}>
                  ↓
                </button>
                <button type="button" className="a-btn a-btn--ghost" onClick={() => setItems((a) => a.filter((_, k) => k !== i))} aria-label="Retirer">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div>
        <button type="button" className="a-btn" onClick={() => setOpen(true)}>
          Ajouter des photos ou vidéos
        </button>
      </div>
      {error && <em className="a-error">{error}</em>}
      <MediaLibraryModal
        open={open}
        multiple
        kind="any"
        onClose={() => setOpen(false)}
        onSelect={(ms: MediaItem[]) => {
          setItems((arr) => [...arr, ...ms.filter((m) => !m.mimeType.includes("pdf")).map((m) => ({ mediaId: m.id, kind: "GALLERY", caption: "", url: m.url, thumbUrl: m.thumbUrl, alt: m.alt, mimeType: m.mimeType }))]);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function ListField({ name, label, itemFields, defaultValue, error, booleanFields = [] }: { name: string; label: string; itemFields: { name: string; label: string; wide?: boolean }[]; defaultValue: string; error?: string; booleanFields?: { name: string; label: string }[] }) {
  const [rows, setRows] = useState<Record<string, string | boolean>[]>(() => {
    try {
      const v = JSON.parse(defaultValue || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });
  const blank = () => Object.fromEntries([...itemFields.map((f) => [f.name, ""]), ...booleanFields.map((f) => [f.name, false])]);
  const update = (i: number, k: string, v: string | boolean) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  return (
    <fieldset className="a-field a-field--full a-list">
      <legend>{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((row, i) => (
        <div key={i} className="a-list__row">
          <div className="a-list__fields">
            {itemFields.map((f) => (
              <label key={f.name} className={`a-field ${f.wide ? "a-field--full" : ""}`}>
                <span>{f.label}</span>
                {f.wide ? (
                  <textarea className="a-input" rows={2} value={String(row[f.name] ?? "")} onChange={(e) => update(i, f.name, e.target.value)} />
                ) : (
                  <input className="a-input" value={String(row[f.name] ?? "")} onChange={(e) => update(i, f.name, e.target.value)} />
                )}
              </label>
            ))}
            {booleanFields.map((f) => (
              <label key={f.name} className="a-check">
                <input type="checkbox" checked={Boolean(row[f.name])} onChange={(e) => update(i, f.name, e.target.checked)} />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Supprimer la ligne ${i + 1}`}>
            ✕
          </button>
        </div>
      ))}
      <div>
        <button type="button" className="a-btn" onClick={() => setRows((r) => [...r, blank()])}>
          Ajouter une ligne
        </button>
      </div>
      {error && <em className="a-error">{error}</em>}
    </fieldset>
  );
}

export function SubmitBar({ pending, state, label = "Enregistrer" }: { pending: boolean; state: { ok?: boolean; message?: string }; label?: string }) {
  return (
    <div className="a-submitbar">
      <div aria-live="polite">{state.message && <span className={state.ok ? "a-ok" : "a-error"}>{state.message}</span>}</div>
      <button type="submit" className="a-btn a-btn--primary" disabled={pending}>
        {pending ? "Enregistrement…" : label}
      </button>
    </div>
  );
}

export function ConfirmButton({ children, message, className = "a-btn a-btn--danger" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
