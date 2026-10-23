import type { CursorPaginationResponse } from "#/lib/pagination.schema";

export interface CursorPageQuery {
  perPage: number;
  cursor?: string;
  direction: "forward" | "backward";
}

/** Backward only means anything once there is a cursor to walk back from. */
export const isBackward = (query: CursorPageQuery): boolean =>
  query.direction === "backward" && Boolean(query.cursor);

/**
 * Prisma args for one page. `take` asks for one row more than a page so the caller can tell whether
 * another page exists.
 */
export function cursorArgs(query: { perPage: number; cursor?: string }) {
  return {
    take: query.perPage + 1,
    skip: query.cursor ? 1 : 0,
    cursor: query.cursor ? { id: query.cursor } : undefined,
  };
}

/**
 * Turn the `perPage + 1` rows from `cursorArgs` into a page plus its cursors. The extra row is only
 * used to decide whether a next/previous page exists; it is never returned.
 *
 * `nextCursor` is the last id actually returned, so the next forward page does not skip a row.
 * `prevCursor` is the look-ahead row for a backward page, matching the forward case where it is the
 * cursor row that was skipped.
 */
export function paginate<TRow extends { id: string }>(
  rows: TRow[],
  query: CursorPageQuery,
): CursorPaginationResponse<TRow> {
  const hasExtra = rows.length > query.perPage;
  const page = hasExtra ? rows.slice(0, query.perPage) : rows;
  const lookAhead = hasExtra ? rows[query.perPage]?.id : undefined;

  if (!isBackward(query)) {
    return {
      data: page,
      nextCursor: hasExtra ? page[page.length - 1]?.id : undefined,
      prevCursor: query.cursor,
    };
  }

  return {
    data: page.toReversed(),
    nextCursor: query.cursor,
    prevCursor: lookAhead,
  };
}
