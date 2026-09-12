import { Link } from "@tanstack/react-router";
import { useState } from "react";

export const BRAND_NAME = "PW Study Network";
export const BRAND_DESCRIPTION = "PW Study Network - Educational Learning Platform";
export const LOGO_URL = "https://i.ibb.co/7JhvrF0L/pw-logo.jpg";
export const LOCAL_LOGO_URL = "/pw-logo.jpg";
export const DEFAULT_BANNER_URL =
  "https://i.ibb.co/q32pY46S/file-00000000574481fbb755fc6faf1377a0.png";
export const TELEGRAM_URL = "https://t.me/+lxSx0imjBEo2ZTll";
export const WHATSAPP_URL = "https://whatsapp.com/channel/0029VbCbDOt0VycLRqoBz82x";

export function AppLogo({
  className = "h-9 w-9",
  size = 36,
  alt = BRAND_NAME,
}: {
  className?: string;
  size?: number;
  alt?: string;
}) {
  const [src, setSrc] = useState(LOGO_URL);

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => {
        if (src !== LOCAL_LOGO_URL) {
          setSrc(LOCAL_LOGO_URL);
        }
      }}
      className={`rounded-lg object-contain ${className}`}
    />
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-95">
      <AppLogo
        className={compact ? "h-8 w-8" : "h-10 w-10"}
        size={compact ? 32 : 40}
        alt="PW Study Network"
      />
      <span className="leading-tight">
        <span className="block font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
          PW Study Network
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Educational Platform
        </span>
      </span>
    </Link>
  );
}
