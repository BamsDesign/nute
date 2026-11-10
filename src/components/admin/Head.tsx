import Link from "next/link";

export function AdminHead({ title, description, crumbs = [], actions }: { title: string; description?: string; crumbs?: { href: string; label: string }[]; actions?: React.ReactNode }) {
  return (
    <header className="a-head">
      <div>
        {crumbs.length > 0 && (
          <span className="a-crumb">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                {i > 0 && " / "}
                <Link href={c.href}>{c.label}</Link>
              </span>
            ))}
          </span>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="a-actions">{actions}</div>}
    </header>
  );
}
