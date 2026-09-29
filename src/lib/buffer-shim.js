// Stand-in for Node's `buffer` module in the browser.
// js-yaml (used by gray-matter) optionally requires it for YAML `!!binary` values,
// which our frontmatter never uses. Without this alias Vite logs a warning on every page.
export const Buffer = undefined
export default { Buffer }
