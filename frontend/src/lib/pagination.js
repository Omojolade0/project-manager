const ELLIPSIS = "ellipsis";

// Builds a truncated page-number sequence: always the first and last page,
// the current page and one neighbor on each side, with gaps collapsed into
// a single non-interactive "ellipsis" entry. Returns every page as-is when
// there's nothing worth truncating (totalPages <= 5).
export function getPageNumbers(current, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current]);
  if (current - 1 >= 1) pages.add(current - 1);
  if (current + 1 <= totalPages) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);

  const result = [];
  let prev = null;
  for (const page of sorted) {
    if (prev !== null && page - prev > 1) {
      result.push(ELLIPSIS);
    }
    result.push(page);
    prev = page;
  }
  return result;
}

export { ELLIPSIS };
