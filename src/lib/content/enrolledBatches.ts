import { useCallback, useEffect, useMemo, useState } from "react";
import type { CatalogBatch } from "./catalog.server";

export const ENROLLED_STORAGE_KEY = "appx_enrolled_batches";
const CHANGE_EVENT = "appx_enrolled_batches_changed";

export type EnrolledBatch = {
  id: string;
  batchId: string;
  name: string;
  photo: string | null;
  exam?: string | null;
  className?: string | null;
  language?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  amount?: number | null;
  rawAmount?: string | null;
  byName?: string | null;
  updatedAt?: string | null;
  enrolledAt?: number;
};

/**
 * Safely retrieve enrolled batches from browser localStorage.
 * Guaranteed SSR-safe: returns empty array if window/localStorage is unavailable.
 */
export function getStoredEnrolledBatches(): EnrolledBatch[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ENROLLED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set<string>();
    const sanitized: EnrolledBatch[] = [];

    for (const item of parsed) {
      const bId = item?.batchId || item?.id;
      if (!bId) continue;
      const strId = String(bId);
      if (seenIds.has(strId)) continue;
      seenIds.add(strId);

      sanitized.push({
        id: String(item.id ?? strId),
        batchId: strId,
        name: String(item.name ?? "Batch"),
        photo: item.photo ?? null,
        exam: item.exam ?? null,
        className: item.className ?? item.class ?? null,
        language: item.language ?? null,
        startDate: item.startDate ?? item.start_date ?? null,
        endDate: item.endDate ?? item.end_date ?? null,
        amount: item.amount != null ? Number(item.amount) : null,
        rawAmount: item.rawAmount != null ? String(item.rawAmount) : null,
        byName: item.byName ?? null,
        updatedAt: item.updatedAt ?? null,
        enrolledAt: item.enrolledAt ? Number(item.enrolledAt) : Date.now(),
      });
    }

    return sanitized;
  } catch (err) {
    console.error("Failed to parse appx_enrolled_batches from localStorage:", err);
    return [];
  }
}

/**
 * Save enrolled batches array to browser localStorage and notify subscribers.
 */
export function saveStoredEnrolledBatches(batches: EnrolledBatch[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    // deduplicate by unique batchId
    const seen = new Set<string>();
    const unique = batches.filter((b) => {
      const id = String(b.batchId || b.id);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    window.localStorage.setItem(ENROLLED_STORAGE_KEY, JSON.stringify(unique));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (err) {
    console.error("Failed to save appx_enrolled_batches to localStorage:", err);
  }
}

/**
 * Enroll a batch. Returns true if newly enrolled, false if already present.
 */
export function enrollBatch(batch: CatalogBatch | EnrolledBatch): boolean {
  if (typeof window === "undefined") return false;
  const current = getStoredEnrolledBatches();
  const bId = String(batch.batchId || batch.id);
  if (!bId) return false;

  const alreadyEnrolled = current.some((b) => String(b.batchId || b.id) === bId);
  if (alreadyEnrolled) return false;

  const newEntry: EnrolledBatch = {
    id: String(batch.id || bId),
    batchId: bId,
    name: batch.name,
    photo: batch.photo ?? null,
    exam: batch.exam ?? null,
    className: batch.className ?? null,
    language: batch.language ?? null,
    startDate: batch.startDate ?? null,
    endDate: batch.endDate ?? null,
    amount: batch.amount ?? null,
    rawAmount: batch.rawAmount ?? null,
    byName: batch.byName ?? null,
    updatedAt: batch.updatedAt ?? null,
    enrolledAt: Date.now(),
  };

  saveStoredEnrolledBatches([newEntry, ...current]);
  return true;
}

/**
 * Remove an enrolled batch by batchId.
 */
export function removeEnrolledBatch(batchId: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredEnrolledBatches();
  const filtered = current.filter((b) => String(b.batchId || b.id) !== String(batchId));
  saveStoredEnrolledBatches(filtered);
}

/**
 * Check if a batch is enrolled.
 */
export function isBatchEnrolled(batchId: string): boolean {
  if (typeof window === "undefined") return false;
  const current = getStoredEnrolledBatches();
  return current.some((b) => String(b.batchId || b.id) === String(batchId));
}

/**
 * Hook to consume enrolled batches state reactively with immediate sync across components and tabs.
 * Hydration-safe: initializes empty during SSR/first client pass, then hydrates cleanly from localStorage.
 */
export function useEnrolledBatches() {
  const [batches, setBatches] = useState<EnrolledBatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial read on client mount to avoid SSR hydration mismatches
    setBatches(getStoredEnrolledBatches());
    setIsLoaded(true);

    const handleSync = () => {
      setBatches(getStoredEnrolledBatches());
    };

    window.addEventListener(CHANGE_EVENT, handleSync);
    window.addEventListener("storage", (e) => {
      if (e.key === ENROLLED_STORAGE_KEY) {
        handleSync();
      }
    });

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const count = useMemo(() => {
    const ids = new Set(batches.map((b) => String(b.batchId || b.id)).filter(Boolean));
    return ids.size;
  }, [batches]);

  const enroll = useCallback((batch: CatalogBatch | EnrolledBatch) => {
    return enrollBatch(batch);
  }, []);

  const remove = useCallback((batchId: string) => {
    removeEnrolledBatch(batchId);
  }, []);

  const checkEnrolled = useCallback(
    (batchId: string) => {
      return batches.some((b) => String(b.batchId || b.id) === String(batchId));
    },
    [batches],
  );

  return {
    enrolledBatches: batches,
    count,
    isLoaded,
    enroll,
    remove,
    isEnrolled: checkEnrolled,
  };
}
