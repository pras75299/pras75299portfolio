export const setCollectionCacheHeaders = (
  res,
  {
    browserMaxAge = 0,
    sMaxAge = 300,
    staleWhileRevalidate = 60,
  } = {}
) => {
  const sharedCacheValue = `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;

  res.setHeader(
    "Cache-Control",
    `public, max-age=${browserMaxAge}, must-revalidate`
  );
  res.setHeader("CDN-Cache-Control", sharedCacheValue);
  res.setHeader("Vercel-CDN-Cache-Control", sharedCacheValue);
};
