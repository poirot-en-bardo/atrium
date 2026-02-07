import Tabletop from 'tabletop';

export interface SheetArtwork {
  id: string;
  price?: number;
  sold?: boolean;
}

const truthyValues = new Set(['true', 'yes', '1', 'y', 'sold']);

function normalizeSold(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return truthyValues.has(value.trim().toLowerCase());
  return false;
}

export async function fetchExhibitionSheet(
  spreadsheetId: string,
  exhibitionId: string
): Promise<SheetArtwork[]> {
  if (!spreadsheetId) return [];

  const data = await Tabletop.init({
    key: spreadsheetId,
    simpleSheet: false,
  });

  const sheet = data[exhibitionId];
  if (!sheet) return [];

  return sheet.map((row: Record<string, string>) => ({
    id: row['Artwork ID'],
    price: row['Price'] ? Number(row['Price']) : undefined,
    sold: normalizeSold(row['Sold']),
  }));
}
