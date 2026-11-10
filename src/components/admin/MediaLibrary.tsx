"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaItem = { id: string; url: string; thumbUrl: string | null; alt: string; originalName: string; mimeType: string; category: string };

const CATEGORIES = [
  ["BRAND", "Logo et identité"],
  ["TEAM", "Équipe"],
  ["PROJECTS", "Projets"],
  ["INTERVENTIONS", "Interventions"],
  ["TRAINING", "Formations"],
  ["SEMINARS", "Séminaires"],
  ["EVENTS", "Événements"],
  ["PRODUCTS", "Produits"],
  ["VIDEOS", "Vidéos"],
  ["OTHER", "Autres"],
] as const;

const MAX_REQUEST = 4 * 1024 * 1024;

/** Réduit les grandes photos dans le navigateur (≤ 2400 px, JPEG) pour respecter la limite des hébergeurs serverless. */
async function prepare(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= MAX_REQUEST || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function Uploader({ onUploaded, defaultCategory = "OTHER", accept = "image/*,video/mp4,video/webm,application/pdf" }: { onUploaded: (m: MediaItem) => void; defaultCategory?: string; accept?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(defaultCategory);
  const [progress, setProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    let i = 0;
    for (const file of Array.from(files)) {
      i++;
      setProgress(`${i} / ${files.length} — ${file.name}`);
      const fd = new FormData();
      fd.append("file", await prepare(file));
      fd.append("category", category);
      try {
        const r = await fetch("/api/cms/upload", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (r.status === 413) setError(`${file.name} : fichier trop lourd pour l'hébergement (4 Mo max. par envoi). Pour les vidéos, publiez-les sur YouTube et collez le lien.`);
        else if (!r.ok) setError(`${file.name} : ${j.error ?? "échec du téléversement"}`);
        else onUploaded(j.media);
      } catch {
        setError(`${file.name} : connexion interrompue.`);
      }
    }
    setBusy(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="a-uploader">
      <div className="a-uploader__row">
        <label className="a-field" style={{ minWidth: 180 }}>
          <span>Catégorie</span>
          <select className="a-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="a-btn a-btn--primary" aria-disabled={busy}>
          {busy ? "Téléversement…" : "Téléverser des fichiers"}
          <input ref={inputRef} type="file" multiple accept={accept} hidden disabled={busy} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      <p className="a-hint">JPG, PNG, WebP, AVIF, HEIC (15 Mo), MP4/WebM (250 Mo), PDF (20 Mo). Les images sont optimisées et leurs métadonnées (dont la géolocalisation) supprimées.</p>
      {progress && <p className="a-hint">{progress}</p>}
      {error && <p className="a-error">{error}</p>}
    </div>
  );
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  kind = "image",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  kind?: "image" | "video" | "any";
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, ...(kind !== "any" ? { kind } : {}) });
    const r = await fetch(`/api/cms/media?${params}`);
    if (r.ok) setItems((await r.json()).items);
    setLoading(false);
  }, [q, kind]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setSelected([]);
      load();
    } else if (!open && d.open) d.close();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, open, load]);

  const toggle = (id: string) => setSelected((s) => (multiple ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id]));

  return (
    <dialog ref={dialogRef} className="a-dialog" onClose={onClose} aria-label="Médiathèque">
      <div className="a-dialog__head">
        <h2>Médiathèque</h2>
        <button type="button" className="a-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
      <div className="a-dialog__body">
        <Uploader
          accept={kind === "image" ? "image/*" : kind === "video" ? "video/mp4,video/webm" : undefined}
          onUploaded={(m) => {
            setItems((it) => [m, ...it]);
            setSelected((s) => (multiple ? [...s, m.id] : [m.id]));
          }}
        />
        <input className="a-input" type="search" placeholder="Rechercher par description ou nom de fichier…" value={q} onChange={(e) => setQ(e.target.value)} style={{ margin: "1rem 0" }} />
        {loading && !items.length ? (
          <p className="a-hint">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="a-hint">Aucun média. Téléversez vos premières photographies.</p>
        ) : (
          <ul className="a-media-grid">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" className="a-media-tile" aria-pressed={selected.includes(m.id)} onClick={() => toggle(m.id)} onDoubleClick={() => !multiple && onSelect([m])}>
                  {m.mimeType.startsWith("image/") ? <img src={m.thumbUrl ?? m.url} alt="" loading="lazy" /> : <span className="a-media-tile__file">{m.mimeType.split("/")[1]?.toUpperCase()}</span>}
                  <span className="a-media-tile__name">{m.alt || m.originalName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="a-dialog__foot">
        <span className="a-hint">{selected.length} sélectionné(s)</span>
        <button type="button" className="a-btn a-btn--primary" disabled={!selected.length} onClick={() => onSelect(selected.map((id) => items.find((i) => i.id === id)!).filter(Boolean))}>
          {multiple ? "Ajouter la sélection" : "Choisir"}
        </button>
      </div>
    </dialog>
  );
}
