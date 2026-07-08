export type Repo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  R: "#198CE7",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00B4AB",
  Dockerfile: "#384d54",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Perl: "#0298c3",
  PowerShell: "#012456",
  Nix: "#7e7eff",
  Zig: "#ec915c",
  Julia: "#a270ba",
};

export function languageColor(language: string | null | undefined): string {
  if (!language) return "#8b8b8b";
  return GITHUB_LANGUAGE_COLORS[language] ?? "#8b8b8b";
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit) {
      const value = Math.round(diffSec / secondsInUnit);
      return rtf.format(-value, unit);
    }
  }
  return rtf.format(-diffSec, "second");
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1_000_000) return Math.round(n / 1000) + "k";
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
}
