/** Assessment reports use stable Portuguese labels; the browser translates the stored labels when possible. */
export const t = (key: string, values: Record<string, unknown> = {}) => key.replace(/\{(\w+)\}/g, (all, k) => String(values[k] ?? all));
