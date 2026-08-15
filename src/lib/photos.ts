import type { DishPhoto } from "./types";

const FETCH_TIMEOUT_MS = 6000;

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Sous/1.0 (recipe app)" },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

interface OpenverseResult {
  title?: string;
  url?: string;
  thumbnail?: string;
  creator?: string;
  license?: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url?: string;
}

async function searchOpenverse(query: string, limit: number): Promise<DishPhoto[]> {
  const url =
    "https://api.openverse.org/v1/images/?" +
    new URLSearchParams({
      q: query,
      page_size: String(limit * 2),
      mature: "false",
      category: "photograph",
      license_type: "commercial",
    });
  const data = (await fetchJson(url)) as { results?: OpenverseResult[] } | null;
  if (!data?.results) return [];

  return data.results
    .filter((result) => Boolean(result.url))
    .slice(0, limit)
    .map((result) => ({
      url: result.thumbnail ?? result.url!,
      fullUrl: result.url!,
      title: result.title ?? query,
      credit: result.creator ?? "Unknown",
      license: [result.license?.toUpperCase(), result.license_version].filter(Boolean).join(" "),
      licenseUrl: result.license_url ?? null,
      sourceUrl: result.foreign_landing_url ?? result.url!,
      source: "Openverse" as const,
    }));
}

interface CommonsPage {
  index?: number;
  title?: string;
  imageinfo?: {
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    extmetadata?: {
      Artist?: { value?: string };
      LicenseShortName?: { value?: string };
      LicenseUrl?: { value?: string };
    };
  }[];
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

async function searchCommons(query: string, limit: number): Promise<DishPhoto[]> {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: "6",
      gsrlimit: String(limit),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1200",
      format: "json",
      origin: "*",
    });
  const data = (await fetchJson(url)) as { query?: { pages?: Record<string, CommonsPage> } } | null;
  const pages = data?.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
    .sort((a, b) => (a.index ?? Number.MAX_SAFE_INTEGER) - (b.index ?? Number.MAX_SAFE_INTEGER))
    .map((page): DishPhoto | null => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl && !info?.url) return null;
      const meta = info?.extmetadata;
      return {
        url: info?.thumburl ?? info!.url!,
        fullUrl: info?.url ?? info!.thumburl!,
        title: (page.title ?? query).replace(/^File:/, ""),
        credit: meta?.Artist?.value ? stripHtml(meta.Artist.value) : "Wikimedia Commons",
        license: meta?.LicenseShortName?.value ?? "See source",
        licenseUrl: meta?.LicenseUrl?.value ?? null,
        sourceUrl: info?.descriptionurl ?? info!.url!,
        source: "Wikimedia Commons" as const,
      } satisfies DishPhoto;
    })
    .filter((photo): photo is DishPhoto => photo !== null)
    .slice(0, limit);
}

/**
 * Freely licensed photos of the dish, best match first. Never throws: a recipe
 * without photos is still a useful recipe.
 */
export async function findDishPhotos(query: string, limit = 3): Promise<DishPhoto[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [openverse, commons] = await Promise.all([
    searchOpenverse(trimmed, limit),
    searchCommons(trimmed, limit),
  ]);

  const merged: DishPhoto[] = [];
  const seen = new Set<string>();
  for (const photo of [...commons, ...openverse]) {
    if (seen.has(photo.fullUrl)) continue;
    seen.add(photo.fullUrl);
    merged.push(photo);
    if (merged.length === limit) break;
  }
  return merged;
}
