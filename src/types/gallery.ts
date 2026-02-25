export interface Artist {
  id: string;
  name: string;
  photoUrl: string;
  bio: string;
  contact: string;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
}

export interface ArtworkRecord {
  id: string;
  title: string;
  artistId: string;
  imageUrl: string;
  floorId: string;
  roomId: string;
  year?: string;
  description?: string;
  price?: number;
  sold?: boolean;
  forSale?: boolean;
}

export interface Artwork extends Omit<ArtworkRecord, 'artistId'> {
  artist: Artist;
}
