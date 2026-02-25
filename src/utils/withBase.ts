function withCacheBuster(url: string): string {
  const version = import.meta.env.PUBLIC_ASSET_VERSION?.trim();
  if (!version) return url;

  const [withoutHash, hash = ''] = url.split('#', 2);
  const separator = withoutHash.includes('?') ? '&' : '?';
  return `${withoutHash}${separator}v=${encodeURIComponent(version)}${hash ? `#${hash}` : ''}`;
}

function shouldVersionPath(url: string): boolean {
  const path = url.startsWith('/') ? url : `/${url}`;
  return path.startsWith('/images/') || path.startsWith('/favicon');
}

export function withAssetVersion(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;
  if (!shouldVersionPath(url)) return url;
  return withCacheBuster(url);
}

export function withBase(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  const base = import.meta.env.BASE_URL || '/';
  const resolved = path.startsWith('/') ? `${base}${path.slice(1)}` : `${base}${path}`;
  return withAssetVersion(resolved);
}
