import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router'

/**
 * Pretty-JSON search serialization for nice, shareable URLs (FixMyCity pattern).
 *
 * TanStack's default JSON serializer percent-encodes punctuation, producing
 * URLs like `?view=%7B%22lng%22%3A13.4%7D`. We keep the same JSON parsing but
 * decode the punctuation that browsers tolerate in a query string, so the URL
 * reads `?view={"lng":13.4}` / `?map=13.5/52.49/13.42`.
 *
 * Kept encoded (real URL-breakers): # & = < > ` % +
 */
const parse = parseSearchWith(JSON.parse)
const stringifyDefault = stringifySearchWith(JSON.stringify)

function makePretty(search: string): string {
  return search
    .replaceAll('%22', '"')
    .replaceAll('%2C', ',')
    .replaceAll('%2F', '/')
    .replaceAll('%27', "'")
    .replaceAll('%28', '(')
    .replaceAll('%29', ')')
    .replaceAll('%3A', ':')
    .replaceAll('%3B', ';')
    .replaceAll('%5B', '[')
    .replaceAll('%5D', ']')
    .replaceAll('%7B', '{')
    .replaceAll('%7D', '}')
}

export const routerSearch = {
  parse,
  stringify: (search: Record<string, unknown>) => makePretty(stringifyDefault(search)),
}
