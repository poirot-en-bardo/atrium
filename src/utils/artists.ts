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

export function getAllArtists(): Artist[] {
  return Array.from(artistsById.values());
}

export function getArtistById(id: string): Artist | undefined {
  return artistsById.get(id);
}
