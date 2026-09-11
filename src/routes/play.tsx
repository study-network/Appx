import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Download, RefreshCw, Play } from "lucide-react";

import { buildPlayerUrl, scheduleDetailsQuery, attachmentUrl } from "@/lib/content/client";

type PlaySearch = {
  batchSlug: string;
  subjectSlug: string;
  scheduleId: string;
  batchId: string;
  title?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export const Route = createFileRoute("/play")({
  validateSearch: (search: Record<string, unknown>): PlaySearch => ({
    batchSlug: str(search["batchSlug"]),
    subjectSlug: str(search["subjectSlug"]),
    scheduleId: str(search["scheduleId"]),
    batchId: str(search["batchId"]),
    title: typeof search["title"] === "string" ? search["title"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "PW Study Network — Lecture Player" },
      {
        name: "description",
        content: "Watch PW Study Network lectures with notes and attachments.",
      },
      { property: "og:title", content: "PW Study Network — Lecture Player" },
      {
        property: "og:description",
        content: "Watch PW Study Network lectures with notes and attachments.",
      },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { batchSlug, subjectSlug, scheduleId, batchId, title } = Route.useSearch();
  const [isInIframe, setIsInIframe] = useState(false);

  const details = useQuery({
    ...scheduleDetailsQuery(batchSlug, subjectSlug, scheduleId),
    enabled: Boolean(batchSlug && subjectSlug && scheduleId),
  });

  const target = details.data ? buildPlayerUrl(details.data, batchId) : null;

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  useEffect(() => {
    // Only auto-redirect if NOT inside an iframe (to avoid sandbox restrictions)
    if (target && !isInIframe) {
      const timer = setTimeout(() => {
        window.location.href = target;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [target, isInIframe]);

  const attachments =
    details.data?.homeworkIds?.flatMap((h) =>
      (h.attachmentIds ?? []).map((a) => ({
        ...a,
        note: h.note ?? h.topic ?? "Lecture Note",
      })),
    ) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/batch/$batchId/$subjectSlug"
          params={{ batchId, subjectSlug }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Subject
        </Link>

        {target && (
          <a
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
          </a>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {details.isLoading ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading lecture details…</p>
          </div>
        ) : details.isError ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              {(details.error as Error).message || "Couldn't load this lecture."}
            </p>
            <button
              onClick={() => details.refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : target ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={target}
              title={title ?? details.data?.topic ?? "Lecture Player"}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
            <Play className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Player URL not available</p>
          </div>
        )}

        <div className="border-t border-border p-5">
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title ?? details.data?.topic ?? details.data?.videoDetails?.name ?? "Lecture"}
          </h1>
          {details.data?.date && (
            <p className="mt-1 text-xs text-muted-foreground">
              Date: {new Date(details.data.date).toLocaleDateString()}
            </p>
          )}

          {attachments.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Lecture Notes & Documents
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((att) => {
                  const url = attachmentUrl(att);
                  return (
                    <a
                      key={att._id}
                      href={url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate font-medium">{att.name || att.note}</span>
                      </div>
                      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
