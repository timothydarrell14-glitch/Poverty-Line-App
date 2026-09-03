export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const then = new Date(isoString).getTime();
  const diffMinutes = Math.round((Date.now() - then) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}
