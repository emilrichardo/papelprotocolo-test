import React, { useEffect, useState } from "react";
import { Copy, FileText, Scan, Loader2 } from "lucide-react";

export function SkeletonLoader({ totalPages = 6 }) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
    }, 2500); // Change page every 2.5 seconds to simulate scanning
    return () => clearInterval(interval);
  }, [totalPages]);

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm z-50">
      {/* Scanning Container */}
      <div className="relative w-[300px] h-[420px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>

        {/* Lines Skeleton (35 lines) */}
        <div className="p-4 space-y-2 relative">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div
                className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-sm animate-pulse"
                style={{
                  width: `${60 + ((i * 3) % 40)}%`, // Deterministic width based on index
                  opacity: 1 - i * 0.02,
                }}
              />
            </div>
          ))}
        </div>

        {/* Scanning Bar Animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `,
          }}
        />
      </div>

      {/* Status Text using skeleton concept */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-lg animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Escaneando documento...</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Procesando página {currentPage} de {totalPages}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs mt-2">
          Extrayendo comparecientes, fechas y metadatos notariales.
        </p>
      </div>
    </div>
  );
}
