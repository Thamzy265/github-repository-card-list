"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { Repo } from "@/lib/github";
import { RepoCard } from "./RepoCard";

type Props = { username: string };

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; repos: Repo[] };

export function RepoList({ username }: Props) {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const searchId = useId();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(
            username,
          )}/repos?per_page=100&sort=updated`,
          {
            headers: { Accept: "application/vnd.github+json" },
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`GitHub user "${username}" not found.`);
          }
          if (res.status === 403) {
            throw new Error(
              "GitHub API rate limit reached. Please try again in a few minutes.",
            );
          }
          throw new Error(
            `GitHub returned ${res.status} ${res.statusText}.`,
          );
        }

        const data: Repo[] = await res.json();
        setState({ status: "success", repos: data });
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong while loading repositories.",
        });
      }
    }

    load();
    return () => controller.abort();
  }, [username]);

  const filtered = useMemo(() => {
    if (state.status !== "success") return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.repos;
    return state.repos.filter((r) => r.name.toLowerCase().includes(q));
  }, [state, query]);

  const totalCount = state.status === "success" ? state.repos.length : 0;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={searchId}
          className="text-sm font-medium text-black/70 dark:text-white/70"
        >
          Filter repositories
        </label>
        <div className="relative">
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            disabled={state.status !== "success"}
            aria-describedby={`${searchId}-count`}
            className="w-full rounded-lg border border-black/15 bg-white/70 px-4 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-black/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:placeholder:text-white/40"
          />
        </div>
        <p
          id={`${searchId}-count`}
          className="text-xs text-black/50 dark:text-white/50"
          aria-live="polite"
        >
          {state.status === "success" &&
            (query
              ? `Showing ${filtered.length} of ${totalCount} repositories`
              : `${totalCount} repositories`)}
        </p>
      </div>

      {state.status === "loading" && <LoadingGrid />}
      {state.status === "error" && (
        <ErrorPanel message={state.message} />
      )}
      {state.status === "success" && filtered.length === 0 && (
        <EmptyState query={query} totalCount={totalCount} />
      )}
      {state.status === "success" && filtered.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((repo) => (
            <li key={repo.id}>
              <RepoCard repo={repo} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LoadingGrid() {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy
      aria-label="Loading repositories"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-44 animate-pulse rounded-xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]"
        />
      ))}
    </ul>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-300/60 bg-red-50/70 p-5 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100"
    >
      <p className="font-semibold">Couldn&apos;t load repositories</p>
      <p className="mt-1 opacity-90">{message}</p>
    </div>
  );
}

function EmptyState({
  query,
  totalCount,
}: {
  query: string;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        This user has no public repositories.
      </p>
    );
  }
  return (
    <p className="rounded-xl border border-dashed border-black/15 p-8 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
      No repositories match <span className="font-medium">&ldquo;{query}&rdquo;</span>.
    </p>
  );
}
