export type RepoMeta = {
  pushedAt: Date;
  languages: string[];
  latestRelease: string | null;
};

// Optional repository metadata is fetched once per repository per build.
const cache = new Map<string, Promise<RepoMeta | null>>();

const token = import.meta.env?.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

async function ghFetch<T>(path: string): Promise<T | null> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

async function fetchRepoMeta(repo: string): Promise<RepoMeta | null> {
  try {
    const [repoData, languages, release] = await Promise.all([
      ghFetch<Record<string, unknown>>(`/repos/${repo}`),
      ghFetch<Record<string, unknown>>(`/repos/${repo}/languages`),
      ghFetch<Record<string, unknown>>(`/repos/${repo}/releases/latest`),
    ]);
    if (!repoData || typeof repoData.pushed_at !== 'string') return null;
    return {
      pushedAt: new Date(repoData.pushed_at),
      // The languages endpoint returns bytes per language, largest first.
      languages: Object.keys(languages ?? {}).slice(0, 3),
      latestRelease: typeof release?.tag_name === 'string' ? release.tag_name : null,
    };
  } catch (error) {
    console.warn(`[github] Skipping repo metadata for ${repo}: ${error}`);
    return null;
  }
}

function repositoryPath(githubUrl: string): string | null {
  try {
    const { hostname, pathname } = new URL(githubUrl);
    if (hostname !== 'github.com') return null;
    const [owner, name] = pathname.replace(/^\/|\/$/g, '').split('/');
    if (!owner || !name) return null;
    return `${owner}/${name}`.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Build-time GitHub metadata for a repository URL from project frontmatter.
 * Returns null (page renders without the metadata strip) on any API failure
 * so a GitHub outage never fails the build.
 */
export function getRepoMeta(githubUrl: string): Promise<RepoMeta | null> {
  const repo = repositoryPath(githubUrl);
  if (!repo) return Promise.resolve(null);

  let pending = cache.get(repo);
  if (!pending) {
    pending = fetchRepoMeta(repo);
    cache.set(repo, pending);
  }
  return pending;
}
