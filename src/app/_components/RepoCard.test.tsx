import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Repo } from "@/lib/github";
import { RepoCard } from "./RepoCard";

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: 1,
    name: "example",
    full_name: "acme/example",
    html_url: "https://github.com/acme/example",
    description: "A useful thing.",
    language: "TypeScript",
    stargazers_count: 42,
    forks_count: 3,
    open_issues_count: 0,
    topics: [],
    updated_at: "2026-07-01T00:00:00Z",
    pushed_at: "2026-07-01T00:00:00Z",
    fork: false,
    archived: false,
    ...overrides,
  };
}

describe("RepoCard", () => {
  it("links to the repository on GitHub", () => {
    render(<RepoCard repo={makeRepo()} />);
    const link = screen.getByRole("link", { name: /example/ });
    expect(link).toHaveAttribute("href", "https://github.com/acme/example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the description when present", () => {
    render(<RepoCard repo={makeRepo({ description: "Explains itself." })} />);
    expect(screen.getByText("Explains itself.")).toBeInTheDocument();
  });

  it("shows the fallback text when the description is null", () => {
    render(<RepoCard repo={makeRepo({ description: null })} />);
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("shows the fallback text when the description is only whitespace", () => {
    render(<RepoCard repo={makeRepo({ description: "   " })} />);
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("caps visible topics at 5 and shows an overflow indicator", () => {
    render(
      <RepoCard
        repo={makeRepo({
          topics: ["a", "b", "c", "d", "e", "f", "g"],
        })}
      />,
    );
    for (const topic of ["a", "b", "c", "d", "e"]) {
      expect(screen.getByText(topic)).toBeInTheDocument();
    }
    expect(screen.queryByText("f")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders no topic list when there are no topics", () => {
    const { container } = render(<RepoCard repo={makeRepo()} />);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("shows fork and archived badges only when applicable", () => {
    const { rerender } = render(<RepoCard repo={makeRepo()} />);
    expect(screen.queryByText("fork")).not.toBeInTheDocument();
    expect(screen.queryByText("archived")).not.toBeInTheDocument();

    rerender(<RepoCard repo={makeRepo({ fork: true, archived: true })} />);
    expect(screen.getByText("fork")).toBeInTheDocument();
    expect(screen.getByText("archived")).toBeInTheDocument();
  });

  it("omits the language row when language is null", () => {
    render(<RepoCard repo={makeRepo({ language: null })} />);
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  });
});
