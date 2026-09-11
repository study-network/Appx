/**
 * Batch sorting utilities.
 * Ensures 2027 batches are prioritized and displayed first,
 * with stable preservation of existing relative ordering.
 */

export function is2027Batch(batch: {
  name?: string | null;
  exam?: string | null;
  className?: string | null;
  startDate?: string | null;
  [key: string]: unknown;
}): boolean {
  if (!batch) return false;

  const checkText = (val: unknown): boolean => {
    if (typeof val !== "string") return false;
    return /2027/.test(val);
  };

  if (checkText(batch.name)) return true;
  if (checkText(batch.exam)) return true;
  if (checkText(batch.className)) return true;
  if (checkText(batch.startDate)) return true;

  for (const [key, value] of Object.entries(batch)) {
    if (
      typeof value === "string" &&
      (key.toLowerCase().includes("year") ||
        key.toLowerCase().includes("title") ||
        key.toLowerCase().includes("tag") ||
        key.toLowerCase().includes("batch"))
    ) {
      if (checkText(value)) return true;
    }
  }

  return false;
}

/**
 * Stably partitions/sorts an array of batches so that any batches
 * with 2027 in their name, title, or details appear first.
 * The original relative order within 2027 batches and within non-2027 batches
 * is strictly preserved.
 *
 * Does not mutate the input array.
 */
export function sortBatches2027First<
  T extends {
    name?: string | null;
    exam?: string | null;
    className?: string | null;
    startDate?: string | null;
  },
>(batches: readonly T[] | null | undefined): T[] {
  if (!batches || !Array.isArray(batches)) return [];
  if (batches.length <= 1) return [...batches];

  const batches2027: T[] = [];
  const otherBatches: T[] = [];

  for (const batch of batches) {
    if (is2027Batch(batch)) {
      batches2027.push(batch);
    } else {
      otherBatches.push(batch);
    }
  }

  return [...batches2027, ...otherBatches];
}
