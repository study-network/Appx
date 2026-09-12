import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  Wordmark,
  TELEGRAM_URL,
  WHATSAPP_URL,
  BRAND_NAME,
  BRAND_DESCRIPTION,
  LOGO_URL,
} from "../components/apex/branding";
import { TelegramPopup } from "../components/apex/TelegramPopup";
import { useEnrolledBatches } from "../lib/content/enrolledBatches";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: BRAND_NAME },
      {
        name: "description",
        content: BRAND_DESCRIPTION,
      },
      { name: "application-name", content: BRAND_NAME },
      { name: "author", content: BRAND_NAME },
      { property: "og:title", content: BRAND_NAME },
      {
        property: "og:description",
        content: BRAND_DESCRIPTION,
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: LOGO_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: BRAND_NAME },
      { name: "twitter:description", content: BRAND_DESCRIPTION },
      { name: "twitter:image", content: LOGO_URL },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/jpeg", href: "/pw-logo.jpg" },
      { rel: "shortcut icon", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/pw-logo.jpg" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { count, isLoaded } = useEnrolledBatches();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Wordmark />

            {/* Desktop Navigation: Home | Batches | Enrolled Batches (count) | Telegram | WhatsApp */}
            <nav className="hidden items-center gap-1.5 text-xs font-semibold sm:text-sm md:flex lg:gap-2">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-accent/80 text-foreground font-bold shadow-xs" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/batches"
                activeProps={{ className: "bg-accent/80 text-foreground font-bold shadow-xs" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Batches
              </Link>
              <Link
                to="/enrolled"
                activeProps={{ className: "bg-accent/80 text-foreground font-bold shadow-xs" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <span>Enrolled Batches</span>
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  {isLoaded ? `(${count})` : "(0)"}
                </span>
              </Link>
              <div className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join PW Study Network on Telegram"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Telegram
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join PW Study Network on WhatsApp"
                className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
              >
                WhatsApp
              </a>
            </nav>

            {/* Mobile Header Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/enrolled"
                activeProps={{ className: "bg-accent text-foreground font-bold" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-card/70 px-2.5 py-1.5 text-xs font-semibold"
                aria-label="My Enrolled Batches"
              >
                <span role="img" aria-label="Graduation Cap">
                  🎓
                </span>
                <span className="font-bold text-primary">({isLoaded ? count : 0})</span>
              </Link>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join PW Study Network on Telegram"
                className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Telegram
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                className="rounded-lg border border-border bg-card p-1.5 text-foreground transition-colors hover:bg-accent"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen ? (
            <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:hidden animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-1 text-sm font-semibold">
                <Link
                  to="/"
                  activeOptions={{ exact: true }}
                  onClick={() => setMobileMenuOpen(false)}
                  activeProps={{ className: "bg-accent text-foreground font-bold" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors"
                >
                  Home
                </Link>

                <Link
                  to="/batches"
                  onClick={() => setMobileMenuOpen(false)}
                  activeProps={{ className: "bg-accent text-foreground font-bold" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors"
                >
                  Batches
                </Link>

                <Link
                  to="/enrolled"
                  onClick={() => setMobileMenuOpen(false)}
                  activeProps={{ className: "bg-accent text-foreground font-bold" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span role="img" aria-label="Graduation Cap">
                      🎓
                    </span>
                    <span>Enrolled Batches</span>
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                    {isLoaded ? `(${count})` : "(0)"}
                  </span>
                </Link>

                <div className="my-2 border-t border-border/60" />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Telegram
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-border bg-card py-2 text-center text-xs font-bold text-foreground transition-colors hover:bg-accent"
                  >
                    WhatsApp
                  </a>
                </div>
              </nav>
            </div>
          ) : null}
        </header>

        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground">{BRAND_NAME}</p>
              <p className="mt-1">{BRAND_DESCRIPTION}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join PW Study Network on Telegram"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent"
              >
                Join Telegram
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join PW Study Network on WhatsApp"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent"
              >
                Join WhatsApp Channel
              </a>
            </div>
          </div>
        </footer>

        <TelegramPopup />
      </div>
    </QueryClientProvider>
  );
}
