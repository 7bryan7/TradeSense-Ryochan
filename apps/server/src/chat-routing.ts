const webContextPatterns = [
  /\b(search|browse|look up) (the )?(web|internet|online)\b/i,
  /\b(news|headlines?|announcements?)\b/i,
  /\b(listing|delisting|regulation|regulatory|lawsuit|partnership|roadmap)\b/i,
  /\b(hack|exploit|security incident|protocol upgrades?|protocol updates?|project updates?)\b/i,
  /\b(latest|recent|new) (developments?|events?|updates?)\b/i,
];

export function needsWebSearch(question: string): boolean {
  return webContextPatterns.some((pattern) => pattern.test(question));
}

export function buildWebSearchQuery(question: string, symbol: string): string {
  return `${symbol} cryptocurrency ${question.trim()}`.slice(0, 500);
}
