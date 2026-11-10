import Link from "next/link";
import type { Article, Event, Project, TeamMember } from "@/content/types";
import { MediaFrame } from "./MediaFrame";
import { DemoBadge } from "./ui";
import { ARTICLE_CATEGORIES, EVENT_ROLES, EVENT_TYPES, PROJECT_CATEGORIES, labelOf } from "@/lib/taxonomy";
import { formatDate, formatMonth } from "@/lib/format";

export function ProjectCard({ p, ratio = "4 / 3", priority }: { p: Project; ratio?: string; priority?: boolean }) {
  const cat = labelOf(PROJECT_CATEGORIES, p.category);
  return (
    <Link href={`/realisations/${p.slug}`} className="card" data-reveal>
      <MediaFrame src={p.coverUrl} alt={p.coverAlt ?? p.title} ratio={ratio} label={cat} priority={priority} corner={p.isDemo ? <DemoBadge /> : undefined} />
      <div className="card__meta mono">
        <span>{cat}</span>
        {p.location && <span>{p.location}</span>}
        {p.date && <span>{formatMonth(p.date)}</span>}
      </div>
      <h3 className="card__title">{p.title}</h3>
      <p className="card__text">{p.summary}</p>
    </Link>
  );
}

export function EventCard({ e }: { e: Event }) {
  return (
    <Link href={`/activites/${e.slug}`} className="card" data-reveal>
      <MediaFrame src={e.coverUrl} alt={e.coverAlt ?? e.title} ratio="3 / 2" label={labelOf(EVENT_TYPES, e.type)} corner={e.isDemo ? <DemoBadge /> : undefined} />
      <div className="card__meta mono">
        <span>{formatDate(e.date)}</span>
        <span>{labelOf(EVENT_TYPES, e.type)}</span>
      </div>
      <h3 className="card__title">{e.title}</h3>
      <p className="card__text">
        {labelOf(EVENT_ROLES, e.role)}
        {e.location ? ` · ${e.location}` : ""}
      </p>
    </Link>
  );
}

export function TeamCard({ m }: { m: TeamMember }) {
  return (
    <Link href={`/equipe/${m.slug}`} className="card" data-reveal>
      <MediaFrame src={m.photoUrl} alt={m.photoAlt ?? `Portrait de ${m.name}`} ratio="4 / 5" label="Portrait" corner={m.isDemo ? <DemoBadge /> : undefined} sizes="(max-width: 640px) 100vw, 25vw" />
      <div>
        <h3 className="card__title">{m.name}</h3>
        <p className="card__text" style={{ marginTop: "0.35rem" }}>
          {m.position}
          {m.department ? ` · ${m.department}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function ArticleCard({ a }: { a: Article }) {
  return (
    <Link href={`/actualites/${a.slug}`} className="card" data-reveal>
      <MediaFrame src={a.coverUrl} alt={a.coverAlt ?? a.title} ratio="3 / 2" label={labelOf(ARTICLE_CATEGORIES, a.category)} corner={a.isDemo ? <DemoBadge /> : undefined} />
      <div className="card__meta mono">
        <span>{labelOf(ARTICLE_CATEGORIES, a.category)}</span>
        {a.publishedAt && <time dateTime={a.publishedAt.toISOString()}>{formatDate(a.publishedAt)}</time>}
      </div>
      <h3 className="card__title">{a.title}</h3>
      <p className="card__text">{a.excerpt}</p>
    </Link>
  );
}
