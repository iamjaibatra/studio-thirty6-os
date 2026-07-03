/**
 * Converts a title into a URL-safe slug.
 * "The Last Light (Director's Cut)" -> "the-last-light-directors-cut"
 */
export function slugify(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/['"]/g, "") // drop apostrophes/quotes instead of hyphenating them
    .replace(/[^a-z0-9]+/g, "-") // everything else becomes a hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-"); // collapse repeats
}

/**
 * Appends a short random suffix to a slug, used to resolve collisions
 * without a round-trip to the database (e.g. "heist-2024-a1b2").
 */
export function withUniqueSuffix(slug) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}
