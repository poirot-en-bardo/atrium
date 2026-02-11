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

interface Floor {
  id: string;
  name: string;
  rooms: { id: string; name: string }[];
}

interface Artwork {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  floorId: string;
  roomId: string;
  forSale?: boolean;
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
  const artworks = artworksEntry
    ? ((artworksEntry[1] as { default?: Artwork[] }).default ?? (artworksEntry[1] as Artwork[]))
    : [];

  return { floors, artworks };
}
