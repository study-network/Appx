import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { CatalogBatch } from "@/lib/content/catalog.server";
import { DEFAULT_BANNER_URL } from "./branding";

export function BatchCard({ batch }: { batch: CatalogBatch }) {
  const initialBanner = batch.photo?.trim() ? batch.photo : DEFAULT_BANNER_URL;
  const [imgSrc, setImgSrc] = useState(initialBanner);

  useEffect(() => {
    setImgSrc(batch.photo?.trim() ? batch.photo : DEFAULT_BANNER_URL);
  }, [batch.photo]);

  return (
    <Link
      to="/batch/$batchId"
      params={{ batchId: batch.batchId }}
      className="group flex gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent sm:flex-col sm:gap-0 sm:p-0"
    >
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-36 sm:w-full sm:rounded-b-none sm:rounded-t-2xl">
        <img
          src={imgSrc}
          alt={batch.name}
          loading="lazy"
          onError={() => {
            if (imgSrc !== DEFAULT_BANNER_URL) {
              setImgSrc(DEFAULT_BANNER_URL);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{batch.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {batch.className ? <Tag>{batch.className}</Tag> : null}
          {batch.language ? <Tag>{batch.language}</Tag> : null}
          {batch.exam ? <Tag>{batch.exam}</Tag> : null}
        </div>
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {children}
    </span>
  );
}
