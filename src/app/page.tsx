import { RepoList } from "./_components/RepoList";

const GITHUB_USERNAME = "HDRUK";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
          GitHub repositories
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          @{GITHUB_USERNAME}
        </h1>
        <p className="max-w-2xl text-sm text-black/60 dark:text-white/60">
          Public repositories fetched live from the GitHub API. Use the
          search below to filter by name.
        </p>
      </header>

      <RepoList username={GITHUB_USERNAME} />
    </main>
  );
}
