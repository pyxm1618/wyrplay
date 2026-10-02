/** Route-owned illustrated chrome stays separate from the shared marketing header. */
export function marketingChrome(pathname: string) {
  return {
    ownHeader: ["/find-questions", "/play", "/print"].includes(pathname),
    footerAppearance: pathname === "/find-questions" ? "finder" : "default",
  } as const;
}
