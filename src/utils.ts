export function belongsToDomain(
  child: string,
  base: Pick<URL, 'hostname'>
): boolean {
  try {
    const c = new URL(child)
    return (
      c.hostname === base.hostname || c.hostname.endsWith('.' + base.hostname)
    )
  } catch {
    return false
  }
}
