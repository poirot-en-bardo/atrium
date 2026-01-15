import Tabletop from "tabletop";

export interface SheetArtwork {
  id: string;
  price?: number;
  sold?: boolean;
}

export async function fetchExhibitionSheet(spreadsheetId: string, exhibitionId: string): Promise<SheetArtwork[]> {
  const data = await Tabletop.init({
    key: spreadsheetId,
    simpleSheet: false,  // load all sheets
  });

  const sheet = data[exhibitionId];
  if (!sheet) return [];

  return sheet.map((row: any) => ({
    id: row['Artwork ID'],
    price: row['Price'] ? Number(row['Price']) : undefined,
    sold: row['Sold'] === 'TRUE',
  }));
}
