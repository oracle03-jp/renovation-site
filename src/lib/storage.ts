export function extractImagePath(publicUrl: string): string | null {
  const marker = '/object/public/images/';
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}
