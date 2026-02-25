import artistsData from '../data/artists.json';
import type { Artist } from '../types/gallery';

const artists = artistsData as Artist[];
const duplicateArtistIds = artists
  .map((artist) => artist.id)
  .filter((id, index, all) => all.indexOf(id) !== index);

if (duplicateArtistIds.length > 0) {
  throw new Error(`Duplicate artist ids found: ${duplicateArtistIds.join(', ')}`);
}

const artistsById = new Map(artists.map((artist) => [artist.id, artist]));

export function getAllArtists(): Artist[] {
  return artists;
}

export function getArtistById(id: string): Artist | undefined {
  return artistsById.get(id);
}
