'use client';

import { ErrorFallback } from '@/components/ui/ErrorFallback';
import '@/app/globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorFallback error={error} reset={reset} />
      </body>
    </html>
  );
}
