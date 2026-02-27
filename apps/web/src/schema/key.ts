import { createSearchParamsCache, parseAsInteger } from "nuqs/server";

export const keySearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
});
