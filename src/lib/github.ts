type RepoMeta = {
  pushedAt: Date;
  languages: string[];
  latestRelease: string | null;
};

// Metadata is fetched once per repo per build; in `astro dev` this also
// stops every page reload from re-hitting the API.
const cache = new Map<string, Promise<RepoMeta | null>>();

const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

async function ghFetch(path: string): Promise<Record<string, unknown> | null> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchRepoMeta(repo: string): Promise<RepoMeta | null> {
  try {
    const [repoData, languages, release] = await Promise.all([
      ghFetch(`/repos/${repo}`),
      ghFetch(`/repos/${repo}/languages`),
      ghFetch(`/repos/${repo}/releases/latest`),
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

/**
 * Build-time GitHub metadata for a repository URL from project frontmatter.
 * Returns null (page renders without the metadata strip) on any API failure
 * so a GitHub outage never fails the build.
 */
export function getRepoMeta(githubUrl: string): Promise<RepoMeta | null> {
  let repo: string;
  try {
    const { hostname, pathname } = new URL(githubUrl);
    if (hostname !== 'github.com') return Promise.resolve(null);
    const [owner, name] = pathname.replace(/^\/|\/$/g, '').split('/');
    if (!owner || !name) return Promise.resolve(null);
    repo = `${owner}/${name}`;
  } catch {
    return Promise.resolve(null);
  }

  let pending = cache.get(repo);
  if (!pending) {
    pending = fetchRepoMeta(repo);
    cache.set(repo, pending);
  }
  return pending;
}
