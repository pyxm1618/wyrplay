const adsenseRoutes = new Set([
  "/",
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
]);

export function isAdSenseRoute(pathname: string): boolean {
  return adsenseRoutes.has(pathname);
}
