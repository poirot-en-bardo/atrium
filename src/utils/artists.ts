import artistsData from '../data/artists.json';
import type { Artist } from '../types/gallery';

function handleDataIssue(message: string): void {
  if (import.meta.env.DEV) {
    throw new Error(message);
  }
  console.warn(message);
}

const artists = (artistsData as Artist[]).filter((artist) => Boolean(artist?.id?.trim()));
const duplicateArtistIds = artists
  .map((artist) => artist.id)
  .filter((id, index, all) => all.indexOf(id) !== index);

if (duplicateArtistIds.length > 0) {
  handleDataIssue(`[artists] Duplicate artist ids found: ${duplicateArtistIds.join(', ')}`);
}

const artistsById = new Map<string, Artist>();
artists.forEach((artist) => {
  if (artistsById.has(artist.id)) return;
  artistsById.set(artist.id, artist);
});

function getArtistLastNameKey(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] ?? trimmed;
}

function compareArtistsByLastName(a: Artist, b: Artist): number {
  const lastNameComparison = getArtistLastNameKey(a.name).localeCompare(
    getArtistLastNameKey(b.name),
    'ro',
    { sensitivity: 'base' }
  );
  if (lastNameComparison !== 0) return lastNameComparison;
  return a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' });
}

const sortedArtists = Array.from(artistsById.values()).sort(compareArtistsByLastName);

export function getAllArtists(): Artist[] {
  return [...sortedArtists];
}

export function getArtistById(id: string): Artist | undefined {
  return artistsById.get(id);
}
