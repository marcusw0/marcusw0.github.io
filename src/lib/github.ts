export type RepoMeta = {
  pushedAt: Date;
  languages: string[];
  latestRelease: string | null;
};

export type GitHubRepository = {
  name: string;
  url: string;
  description: string;
  primaryLanguage: string | null;
  pushedAt: Date;
  topics: string[];
};

// Metadata is fetched once per repo per build; in `astro dev` this also
// stops every page reload from re-hitting the API.
const cache = new Map<string, Promise<RepoMeta | null>>();
const portfolioCache = new Map<string, Promise<GitHubRepository[]>>();

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

async function fetchPortfolioRepos(username: string): Promise<GitHubRepository[]> {
  try {
    const data = await ghFetch<unknown>(
      `/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=100`,
    );
    if (!Array.isArray(data)) return [];

    return data
      .flatMap((item): GitHubRepository[] => {
        if (!item || typeof item !== 'object') return [];
        const repo = item as Record<string, unknown>;
        const topics = Array.isArray(repo.topics)
          ? repo.topics.filter((topic): topic is string => typeof topic === 'string')
          : [];

        if (
          !topics.includes('portfolio')
          || repo.fork !== false
          || repo.archived !== false
          || repo.disabled !== false
          || typeof repo.name !== 'string'
          || typeof repo.html_url !== 'string'
          || typeof repo.pushed_at !== 'string'
        ) {
          return [];
        }

        return [{
          name: repo.name,
          url: repo.html_url,
          description: typeof repo.description === 'string' && repo.description.trim()
            ? repo.description.trim().replace(/;/g, ',').replace(/:(?!\/\/)/g, '.')
            : 'View the source and documentation on GitHub.',
          primaryLanguage: typeof repo.language === 'string' ? repo.language : null,
          pushedAt: new Date(repo.pushed_at),
          topics: topics.filter((topic) => topic !== 'portfolio').slice(0, 3),
        }];
      })
      .sort((a, b) => b.pushedAt.valueOf() - a.pushedAt.valueOf());
  } catch (error) {
    console.warn(`[github] Skipping portfolio repositories for ${username}: ${error}`);
    return [];
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

/**
 * Returns recently pushed, public repositories that opt in with the
 * `portfolio` GitHub topic. Curated case-study repositories can be excluded
 * so the Projects page never presents the same work twice.
 */
export async function getPortfolioRepos(
  username: string,
  excludedUrls: string[] = [],
  limit = 6,
): Promise<GitHubRepository[]> {
  let pending = portfolioCache.get(username);
  if (!pending) {
    pending = fetchPortfolioRepos(username);
    portfolioCache.set(username, pending);
  }

  const excluded = new Set(
    excludedUrls
      .map(repositoryPath)
      .filter((repo): repo is string => repo !== null),
  );

  return (await pending)
    .filter((repo) => {
      const path = repositoryPath(repo.url);
      return path !== null && !excluded.has(path);
    })
    .slice(0, limit);
}
