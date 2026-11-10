import Link from "next/link";
import type { Event } from "@/content/types";
import { EVENT_ROLES, EVENT_TYPES, labelOf } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";
import { MediaFrame } from "./MediaFrame";
import { DemoBadge } from "./ui";

/** Chronologie des activités groupées par année. */
export function Timeline({ events }: { events: Event[] }) {
  const byYear = new Map<number, Event[]>();
  for (const e of events) {
    const y = new Date(e.date).getUTCFullYear();
    byYear.set(y, [...(byYear.get(y) ?? []), e]);
  }
  return (
    <ol className="timeline">
      {[...byYear.entries()].map(([year, items]) => (
        <li key={year} className="timeline__year">
          <h3>{year}</h3>
          <ol className="timeline__items">
            {items.map((e) => (
              <li key={e.id} className="timeline-item" data-reveal>
                <div className="stack" style={{ "--stack": "0.35rem" } as React.CSSProperties}>
                  <time className="mono" dateTime={e.date.toISOString()}>
                    {formatDate(e.date)}
                  </time>
                  <span className="mono muted">{labelOf(EVENT_TYPES, e.type)}</span>
                </div>
                <div className="stack" style={{ "--stack": "0.75rem" } as React.CSSProperties}>
                  <h4 className="h4">
                    <Link href={`/activites/${e.slug}`} className="text-link" style={{ textDecoration: "none" }}>
                      {e.title}
                    </Link>{" "}
                    {e.isDemo && <DemoBadge />}
                  </h4>
                  <p className="muted">{e.summary}</p>
                  <p className="mono muted">
                    Rôle de NUTE : {labelOf(EVENT_ROLES, e.role)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <Link href={`/activites/${e.slug}`} tabIndex={-1} aria-hidden="true">
                  <MediaFrame src={e.coverUrl} alt="" ratio="3 / 2" label={labelOf(EVENT_TYPES, e.type)} sizes="18rem" />
                </Link>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
