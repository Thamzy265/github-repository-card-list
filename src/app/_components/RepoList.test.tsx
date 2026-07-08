import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Repo } from "@/lib/github";
import { RepoList } from "./RepoList";

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: Math.floor(Math.random() * 1_000_000),
    name: "example",
    full_name: "acme/example",
    html_url: "https://github.com/acme/example",
    description: null,
    language: null,
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
    updated_at: "2026-07-01T00:00:00Z",
    pushed_at: "2026-07-01T00:00:00Z",
    fork: false,
    archived: false,
    ...overrides,
  };
}

function mockOk(repos: Repo[]) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => repos,
  } as Response;
}

function mockError(status: number, statusText: string) {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RepoList", () => {
  it("renders the fetched repositories and the total count", async () => {
    fetchMock.mockResolvedValue(
      mockOk([
        makeRepo({ id: 1, name: "alpha" }),
        makeRepo({ id: 2, name: "beta" }),
      ]),
    );
    render(<RepoList username="acme" />);

    expect(await screen.findByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("2 repositories")).toBeInTheDocument();
  });

  it("passes the username to the GitHub API URL", async () => {
    fetchMock.mockResolvedValue(mockOk([]));
    render(<RepoList username="octocat" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/users/octocat/repos");
  });

  it("filters cards by name in real time without a second fetch", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      mockOk([
        makeRepo({ id: 1, name: "alpha" }),
        makeRepo({ id: 2, name: "beta" }),
        makeRepo({ id: 3, name: "gamma" }),
      ]),
    );
    render(<RepoList username="acme" />);

    await screen.findByText("alpha");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const input = screen.getByLabelText(/filter repositories/i);
    await user.type(input, "et");

    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.queryByText("gamma")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 3 repositories")).toBeInTheDocument();

    // The whole point of the requirement: no extra network calls.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("filters case-insensitively", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      mockOk([makeRepo({ id: 1, name: "SuperCoolRepo" })]),
    );
    render(<RepoList username="acme" />);
    await screen.findByText("SuperCoolRepo");

    await user.type(screen.getByLabelText(/filter repositories/i), "cool");
    expect(screen.getByText("SuperCoolRepo")).toBeInTheDocument();
  });

  it("shows a specific message on 404", async () => {
    fetchMock.mockResolvedValue(mockError(404, "Not Found"));
    render(<RepoList username="ghost-user" />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/ghost-user/);
    expect(alert).toHaveTextContent(/not found/i);
  });

  it("shows a rate-limit message on 403", async () => {
    fetchMock.mockResolvedValue(mockError(403, "Forbidden"));
    render(<RepoList username="acme" />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/rate limit/i);
  });

  it("shows a generic message on other HTTP failures", async () => {
    fetchMock.mockResolvedValue(mockError(500, "Server Error"));
    render(<RepoList username="acme" />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/500/);
  });

  it("shows a generic message when the fetch itself throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("network down"));
    render(<RepoList username="acme" />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/network down/i);
  });

  it("shows the empty state when the user has no repositories", async () => {
    fetchMock.mockResolvedValue(mockOk([]));
    render(<RepoList username="acme" />);

    expect(
      await screen.findByText(/has no public repositories/i),
    ).toBeInTheDocument();
  });

  it("shows a no-match state when the filter has zero results", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      mockOk([makeRepo({ id: 1, name: "alpha" })]),
    );
    render(<RepoList username="acme" />);
    await screen.findByText("alpha");

    await user.type(
      screen.getByLabelText(/filter repositories/i),
      "zzz-nope",
    );

    expect(screen.getByText(/no repositories match/i)).toBeInTheDocument();
    expect(screen.queryByText("alpha")).not.toBeInTheDocument();
  });

  it("shows a loading grid while the request is in flight", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<RepoList username="acme" />);

    expect(screen.getByLabelText(/loading repositories/i)).toHaveAttribute(
      "aria-busy",
    );

    resolveFetch(mockOk([makeRepo({ name: "alpha" })]));
    await screen.findByText("alpha");
    expect(
      screen.queryByLabelText(/loading repositories/i),
    ).not.toBeInTheDocument();
  });

  it("aborts the in-flight request when the username changes", async () => {
    fetchMock.mockImplementation(
      (_url: string, init: { signal?: AbortSignal } = {}) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(
              Object.assign(new Error("aborted"), { name: "AbortError" }),
            );
          });
        }),
    );

    const { rerender } = render(<RepoList username="first" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const firstCallSignal = (
      fetchMock.mock.calls[0][1] as { signal: AbortSignal }
    ).signal;

    rerender(<RepoList username="second" />);
    await waitFor(() => expect(firstCallSignal.aborted).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
