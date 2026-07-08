import type { Repo } from "@/lib/github";
import {
  formatCount,
  formatRelativeTime,
  languageColor,
} from "@/lib/github";

type Props = { repo: Repo };

export function RepoCard({ repo }: Props) {
  const description =
    repo.description?.trim() || "No description provided.";
  const hasDescription = Boolean(repo.description?.trim());

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col justify-between rounded-xl border border-black/10 bg-white/60 p-5 transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate text-base font-semibold text-blue-700 group-hover:underline dark:text-blue-400">
            {repo.name}
          </h2>
          <div className="flex shrink-0 gap-1.5">
            {repo.fork && <Badge>fork</Badge>}
            {repo.archived && <Badge tone="warn">archived</Badge>}
          </div>
        </div>

        <p
          className={
            "line-clamp-3 text-sm " +
            (hasDescription
              ? "text-black/70 dark:text-white/70"
              : "italic text-black/40 dark:text-white/40")
          }
        >
          {description}
        </p>

        {repo.topics.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 5).map((topic) => (
              <li
                key={topic}
                className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                {topic}
              </li>
            ))}
            {repo.topics.length > 5 && (
              <li className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
                +{repo.topics.length - 5}
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/60 dark:text-white/60">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/20"
              style={{ backgroundColor: languageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1"
          title={`${repo.stargazers_count.toLocaleString()} stars`}
        >
          <StarIcon />
          {formatCount(repo.stargazers_count)}
        </span>
        <span
          className="inline-flex items-center gap-1"
          title={`${repo.forks_count.toLocaleString()} forks`}
        >
          <ForkIcon />
          {formatCount(repo.forks_count)}
        </span>
        <span
          className="ml-auto"
          title={new Date(repo.pushed_at).toLocaleString()}
        >
          Updated {formatRelativeTime(repo.pushed_at)}
        </span>
      </div>
    </a>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60";
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
        toneClass
      }
    >
      {children}
    </span>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 fill-current"
    >
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 fill-current"
    >
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z" />
    </svg>
  );
}
