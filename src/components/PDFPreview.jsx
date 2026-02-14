import React from "react";

export function PDFPreview({ file, className }) {
  if (!file) return null;

  const fileUrl = URL.createObjectURL(file);

  return (
    <div
      className={`w-full h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-800 ${className}`}
    >
      <object
        data={fileUrl}
        type="application/pdf"
        className="w-full h-full block"
      >
        <iframe
          src={fileUrl}
          className="w-full h-full border-none"
          title="PDF Preview"
        >
          <p>
            Tu navegador no soporta visualización de PDFs.
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              Descargar PDF
            </a>
          </p>
        </iframe>
      </object>
    </div>
  );
}
