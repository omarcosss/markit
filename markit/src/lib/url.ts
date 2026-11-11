/** Adds https:// when the user types a bare domain, e.g. "dribbble.com". */
export function normalizeUrl(input: string): string {
  const url = input.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `https://${url}`;
}

/** Only http(s) links may be rendered as clickable hrefs; anything else becomes inert. */
export function safeHref(url: string): string {
  return /^https?:\/\//i.test(url.trim()) ? url : "#";
}
