import { getArtistById } from './artists';
import type { Artwork, ArtworkRecord, Floor } from '../types/gallery';

export type ExhibitionStatus = 'current' | 'past' | 'upcoming';

export interface ExhibitionMetadata {
  id: string;
  title: string;
  description: string;
  location: string;
  locationMapUrl: string;
  startDate: string;
  endDate: string;
  thumbnail: string;
}

export interface Exhibition extends ExhibitionMetadata {
  status: ExhibitionStatus;
}

const metadataModules = import.meta.glob('../data/exhibitions/*/*/metadata.json', {
  eager: true,
});
const floorsModules = import.meta.glob('../data/exhibitions/*/*/floors.json', {
  eager: true,
});
const artworksModules = import.meta.glob('../data/exhibitions/*/*/artworks.json', {
  eager: true,
});
const posterModules = import.meta.glob('../data/exhibitions/*/*/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function parseMetadata(module: unknown): ExhibitionMetadata {
  const data = (module as { default?: ExhibitionMetadata }).default ?? (module as ExhibitionMetadata);
  return data;
}

export function getAllExhibitions(): Exhibition[] {
  return Object.entries(metadataModules).map(([file, mod]) => {
    const segments = file.split('/');
    const status = segments[segments.length - 3] as ExhibitionStatus;
    const folderId = segments[segments.length - 2];
    const data = parseMetadata(mod);
    const thumbnailPath = `../data/exhibitions/${status}/${folderId}/${data.thumbnail}`;
    const thumbnail = data.thumbnail.startsWith('/')
      ? data.thumbnail
      : posterModules[thumbnailPath] || data.thumbnail;
    return {
      ...data,
      id: data.id || folderId,
      thumbnail,
      status,
    };
  });
}

export function getExhibitionsByStatus(status: ExhibitionStatus): Exhibition[] {
  return getAllExhibitions()
    .filter((exhibition) => exhibition.status === status)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getExhibitionById(id: string): Exhibition | undefined {
  return getAllExhibitions().find((exhibition) => exhibition.id === id);
}

export function getExhibitionContent(id: string): {
  floors: Floor[];
  artworks: Artwork[];
} {
  const floorsEntry = Object.entries(floorsModules).find(([file]) =>
    file.includes(`/${id}/floors.json`)
  );
  const artworksEntry = Object.entries(artworksModules).find(([file]) =>
    file.includes(`/${id}/artworks.json`)
  );

  const floors = floorsEntry
    ? ((floorsEntry[1] as { default?: Floor[] }).default ?? (floorsEntry[1] as Floor[]))
    : [];
  const artworkRecords = artworksEntry
    ? ((artworksEntry[1] as { default?: ArtworkRecord[] }).default ??
      (artworksEntry[1] as ArtworkRecord[]))
    : [];
  const artworks = artworkRecords.map((artwork) => {
    const artist = getArtistById(artwork.artistId);
    if (!artist) {
      throw new Error(`Unknown artistId "${artwork.artistId}" for artwork "${artwork.id}"`);
    }
    const { artistId: _artistId, ...rest } = artwork;
    return {
      ...rest,
      artist,
    };
  });

  return { floors, artworks };
}
