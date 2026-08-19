const KEY_PREFIX = "coeus_onboarding_seen_";

// Whether this user has already been through (or explicitly skipped) the
// zero-projects onboarding wizard. Deliberately independent of project
// count — once seen, it stays seen even if every project is later deleted.
export function hasSeenOnboarding(userId) {
  if (!userId) return true;
  return localStorage.getItem(KEY_PREFIX + userId) === "1";
}

export function markOnboardingSeen(userId) {
  if (!userId) return;
  localStorage.setItem(KEY_PREFIX + userId, "1");
}
