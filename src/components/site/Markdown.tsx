import ReactMarkdown from "react-markdown";

/** Rendu Markdown sûr : le HTML brut est ignoré, les liens externes sont isolés. */
export function Markdown({ children, className = "prose" }: { children: string | null | undefined; className?: string }) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" /> : null),
          h1: ({ children }) => <h2>{children}</h2>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
