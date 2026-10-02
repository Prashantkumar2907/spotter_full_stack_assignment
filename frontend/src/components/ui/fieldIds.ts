export function fieldDescribedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}
