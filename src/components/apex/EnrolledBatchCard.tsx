import { Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Trash2, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EnrolledBatch } from "@/lib/content/enrolledBatches";
import { DEFAULT_BANNER_URL } from "./branding";

function formatDisplayDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getClassInformation(batch: EnrolledBatch): string {
  const parts: string[] = [];
  if (batch.className?.trim()) {
    const rawClass = batch.className.trim();
    parts.push(/^class/i.test(rawClass) ? rawClass : `Class ${rawClass}`);
  }
  if (batch.exam?.trim()) {
    parts.push(batch.exam.trim());
  }
  if (parts.length > 0) {
    if (batch.language?.trim()) {
      parts.push(batch.language.trim());
    }
    return parts.join(" • ");
  }
  if (batch.byName?.trim()) {
    return batch.byName.trim();
  }
  if (batch.language?.trim()) {
    return `${batch.language.trim()} Medium`;
  }
  return "All Students • Complete Course";
}

function getDateRange(batch: EnrolledBatch): string {
  const start = formatDisplayDate(batch.startDate);
  const end = formatDisplayDate(batch.endDate);
  if (start && end) {
    return `${start} → ${end}`;
  }
  if (start) {
    return `Starts ${start}`;
  }
  if (end) {
    return `Ends ${end}`;
  }
  return "Flexible Schedule";
}

export function EnrolledBatchCard({
  batch,
  onRemove,
}: {
  batch: EnrolledBatch;
  onRemove: (batchId: string) => void;
}) {
  const initialBanner = batch.photo?.trim() ? batch.photo.trim() : DEFAULT_BANNER_URL;
  const [imgSrc, setImgSrc] = useState(initialBanner);

  useEffect(() => {
    setImgSrc(batch.photo?.trim() ? batch.photo.trim() : DEFAULT_BANNER_URL);
  }, [batch.photo]);

  const classInfo = useMemo(() => getClassInformation(batch), [batch]);
  const dateRange = useMemo(() => getDateRange(batch), [batch]);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-accent hover:shadow-md">
      {/* 1. Batch Banner Image (16:9 responsive aspect ratio) */}
      <Link
        to="/batch/$batchId"
        params={{ batchId: batch.batchId }}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-muted"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={imgSrc}
          alt={batch.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (imgSrc !== DEFAULT_BANNER_URL) {
              setImgSrc(DEFAULT_BANNER_URL);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* 2. Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-3">
          {/* Batch Name */}
          <Link
            to="/batch/$batchId"
            params={{ batchId: batch.batchId }}
            className="block outline-none focus-visible:underline"
          >
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
              {batch.name}
            </h3>
          </Link>

          {/* Metadata Section */}
          <div className="space-y-2 pt-1 text-xs text-muted-foreground sm:text-sm">
            {/* 👤 Batch/Class information */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate font-medium">{classInfo}</span>
            </div>

            {/* 📅 Start Date → End Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate font-medium">{dateRange}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Enrolled Status + Action Buttons */}
        <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
          {/* Enrolled Status */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Enrolled
            </span>
            {batch.enrolledAt ? (
              <span className="text-xs text-muted-foreground">
                Enrolled{" "}
                {new Date(batch.enrolledAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : null}
          </div>

          {/* Action Buttons: [ Open Batch ] [ Remove ] */}
          <div className="flex items-center gap-2">
            <Link
              to="/batch/$batchId"
              params={{ batchId: batch.batchId }}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open Batch
            </Link>
            <button
              type="button"
              onClick={() => onRemove(batch.batchId)}
              aria-label={`Remove ${batch.name} from enrolled batches`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-center text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
