import { PaginationMeta } from '../dto/api-response.dto';

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
};

export const buildCursor = (obj: Record<string, any>): string =>
  Buffer.from(JSON.stringify(obj)).toString('base64');

export const parseCursor = (cursor: string): any => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

export const getSkip = (page: number, limit: number): number =>
  (page - 1) * limit;
