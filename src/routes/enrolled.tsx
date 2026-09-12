import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";

import { EnrolledBatchCard } from "@/components/apex/EnrolledBatchCard";
import { CardSkeleton } from "@/components/apex/states";
import { BRAND_NAME } from "@/components/apex/branding";
import { useEnrolledBatches } from "@/lib/content/enrolledBatches";

export const Route = createFileRoute("/enrolled")({
  head: () => ({
    meta: [
      { title: `My Enrolled Batches — ${BRAND_NAME}` },
      {
        name: "description",
        content: `Your enrolled batches on ${BRAND_NAME}. Track and study your courses, lectures, and notes.`,
      },
      { property: "og:title", content: `My Enrolled Batches — ${BRAND_NAME}` },
      {
        property: "og:description",
        content: `Your enrolled batches on ${BRAND_NAME}. Track and study your courses, lectures, and notes.`,
      },
    ],
  }),
  component: EnrolledPage,
});

function EnrolledPage() {
  const { enrolledBatches, count, isLoaded, remove } = useEnrolledBatches();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Enrolled Batches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoaded
              ? count === 1
                ? "1 batch saved on this device"
                : `${count} batches saved on this device`
              : "Loading your enrolled batches..."}
          </p>
        </div>

        {isLoaded && count > 0 ? (
          <Link
            to="/batches"
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary transition-colors hover:underline sm:self-auto"
          >
            <span>Explore more batches</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {!isLoaded ? (
          <CardSkeleton count={3} />
        ) : count === 0 ? (
          /* Empty State */
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">No enrolled batches yet.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse through available batches and click &ldquo;Enroll Now&rdquo; to add them to
              your study list.
            </p>
            <div className="mt-6">
              <Link
                to="/batches"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Explore Batches
              </Link>
            </div>
          </div>
        ) : (
          /* Enrolled Batches Grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {enrolledBatches.map((b) => (
              <EnrolledBatchCard key={b.batchId} batch={b} onRemove={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
