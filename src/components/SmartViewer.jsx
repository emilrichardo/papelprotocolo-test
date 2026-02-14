import React, { useState } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function SmartViewer({ data, className }) {
  const [activePage, setActivePage] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!data || !data.extraction || !data.extraction.extracted_info) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500">
        <p>Formato de datos no reconocido para visualización inteligente.</p>
        <pre className="mt-4 p-4 bg-slate-100 rounded text-xs overflow-auto max-w-full">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const info = data.extraction.extracted_info;
  const paginas = info.paginas || [];
  const comparecientes = info.comparecientes?.comparecientes || [];
  // Merge metadata from root info and specific subsection to ensure all fields are captured
  const metadata = {
    ...info,
    ...info.comunicacional?.contenido_periodistico,
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col h-full gap-6", className)}>
      {/* Content Area: Either Grid or Detail View */}
      {activePage ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Toolbar Header (Navigation) */}
          <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 z-10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePage(null)}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4 rotate-90" /> Volver
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={
                  paginas.findIndex((p) => p.pagina === activePage.pagina) <= 0
                }
                onClick={() => {
                  const idx = paginas.findIndex(
                    (p) => p.pagina === activePage.pagina,
                  );
                  if (idx > 0) setActivePage(paginas[idx - 1]);
                }}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
              <span className="text-xs text-slate-400 font-mono w-16 text-center">
                {paginas.findIndex((p) => p.pagina === activePage.pagina) + 1} /{" "}
                {paginas.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={
                  paginas.findIndex((p) => p.pagina === activePage.pagina) >=
                  paginas.length - 1
                }
                onClick={() => {
                  const idx = paginas.findIndex(
                    (p) => p.pagina === activePage.pagina,
                  );
                  if (idx < paginas.length - 1) setActivePage(paginas[idx + 1]);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scrolled Content - Real Protocol Paper Look */}
          <div className="flex-1 overflow-y-auto bg-slate-200/50 dark:bg-slate-950/50 flex justify-center relative p-4 md:py-8">
            <div className="bg-[#fcfbf9] dark:bg-[#1a1a1a] w-full max-w-[800px] shadow-2xl min-h-[1000px] relative px-8 py-12 md:px-12 md:py-16 text-slate-800 dark:text-slate-200 font-['Courier_Prime']">
              {/* Protocol Header based on Orientation */}
              {activePage.orientacion === "Anverso" ||
              (!activePage.orientacion && activePage.pagina % 2 !== 0) ? (
                // ANVERSO HEADER
                <div className="relative mb-12">
                  {/* Top Layout */}
                  <div className="flex justify-between items-start mb-6">
                    {/* Shield Placeholder - Left */}
                    <div className="w-24 h-24 rounded-full border-4 border-double border-red-800/20 dark:border-red-500/20 flex items-center justify-center opacity-50">
                      <div className="text-[10px] text-center font-serif text-red-900/40 dark:text-red-500/40 font-bold leading-tight">
                        REPUBLICA
                        <br />
                        DE
                        <br />
                        GUATEMALA
                      </div>
                    </div>

                    {/* Number Box - Center/Right */}
                    <div className="flex flex-col items-end">
                      <div className="border-2 border-slate-800 dark:border-slate-500 px-4 py-2 min-w-[200px] flex justify-between items-center bg-white dark:bg-slate-900/50 mb-2">
                        <span className="font-serif text-2xl font-bold">
                          No.
                        </span>
                        <span className="font-mono text-xl text-red-700 dark:text-red-400 font-bold tracking-widest">
                          {/* Mock Folio or extracted metadata if available */}C
                          5818934
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold text-red-700 dark:text-red-500 tracking-[0.2em] opacity-90 scale-y-110">
                      PROTOCOLO
                    </h1>
                  </div>
                </div>
              ) : (
                // REVERSO HEADER
                <div className="relative mb-8 flex justify-center">
                  <div className="border-4 border-double border-slate-700 dark:border-slate-500 px-8 py-3 flex items-center gap-12 bg-white dark:bg-slate-900/50">
                    <span className="font-mono text-xl text-slate-700 dark:text-slate-300 font-bold tracking-widest">
                      5818934
                    </span>
                    <span className="font-serif text-5xl font-bold text-slate-900 dark:text-white">
                      R
                    </span>
                  </div>
                </div>
              )}

              {/* Margins visual guide */}
              <div className="absolute top-0 bottom-0 left-[3.5rem] w-px bg-red-500/20 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-[2rem] w-px bg-red-500/20 pointer-events-none" />

              {/* Line Content */}
              <div className="relative z-0 leading-[2.6rem] tracking-tighter text-justify">
                {Array.from({ length: 25 }).map((_, idx) => {
                  const lineData = activePage.lineas && activePage.lineas[idx];

                  // Highlighting Logic
                  let content = lineData?.texto_original;
                  if (content && comparecientes.length > 0) {
                    // create a regex for all names
                    const names = comparecientes
                      .map((c) => c.compareciente.Nombre_completo_compadeciente)
                      .filter(Boolean);
                    if (names.length > 0) {
                      // Escape special characters in names for regex
                      const escapedNames = names.map((name) =>
                        name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      );
                      const pattern = new RegExp(
                        `(${escapedNames.join("|")})`,
                        "gi",
                      );
                      const parts = content.split(pattern);
                      content = parts.map((part, i) =>
                        names.some(
                          (n) => n.toLowerCase() === part.toLowerCase(),
                        ) ? (
                          <span
                            key={i}
                            className="font-bold bg-yellow-200/50 dark:bg-yellow-900/50 px-1 rounded-sm text-slate-900 dark:text-yellow-100 border-b-2 border-slate-900 dark:border-yellow-200/50"
                          >
                            {part}
                          </span>
                        ) : (
                          part
                        ),
                      );
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="relative border-b border-cyan-200/50 dark:border-cyan-800/30 flex items-baseline h-[2.6rem] w-full group/line"
                    >
                      <span className="absolute left-[-2.5rem] w-8 text-sm text-slate-400 dark:text-slate-600 font-sans select-none text-right flex items-center justify-end h-full pr-2">
                        {idx + 1}
                      </span>
                      <div
                        className={cn(
                          "w-full px-1 group-hover/line:bg-blue-50/10 transition-colors uppercase whitespace-nowrap",
                          !lineData?.texto_original && "opacity-0",
                        )}
                        style={{ fontSize: "0.9em" }}
                      >
                        {content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stamp signature simulation */}
              <div className="mt-12 flex justify-center opacity-80 rotate-[-2deg] pointer-events-none select-none">
                <div className="border-4 border-blue-800 dark:border-blue-400 rounded-full px-6 py-2 inline-block">
                  <div className="text-blue-800 dark:text-blue-400 font-bold font-serif text-lg uppercase tracking-widest">
                    FIRMADO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header / Metadata */}
          {metadata && (
            <div className="space-y-2 shrink-0 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex-1 leading-tight">
                  {metadata.descripcion_tipo_contrato ||
                    metadata.titulo ||
                    "Documento Protocolar"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHash}
                  className="h-6 w-6"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </Button>
              </div>

              {/* Key Value Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Escritura No.
                  </span>
                  <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.numero_escritura || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Fecha
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.fecha_escritura || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Lugar
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.lugar_escritura_publica || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Estado
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                      metadata.estado_escritura_publica === "FIRMADA"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {metadata.estado_escritura_publica || "BORRADOR"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Notario
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.nombre_de_abogado || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Vencimiento
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.vencimiento_escritura_publica || "--"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Año
                  </span>
                  <span className="text-slate-900 dark:text-slate-200 font-medium">
                    {metadata.ano_escritura_publica || "--"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                {metadata["resumen de dos lineas"] || metadata.resumen}
              </p>
            </div>
          )}

          {/* Comparecientes */}
          {comparecientes.length > 0 && (
            <div className="space-y-3 shrink-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Comparecientes (
                {comparecientes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comparecientes.map((item, idx) => {
                  const c = item.compareciente;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {c.Nombre_completo_compadeciente}
                          </p>
                          {c.Rol_compadeciente && (
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {c.Rol_compadeciente}
                            </span>
                          )}
                        </div>
                        {c.Edad_compadeciente && (
                          <span className="text-xs text-slate-500">
                            {c.Edad_compadeciente} años
                          </span>
                        )}
                      </div>
                      {c.Id_doc_identificacion && (
                        <p className="mt-2 text-xs text-slate-500 break-words">
                          {c.Tipo_doc_identificacion}: {c.Id_doc_identificacion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pages Grid */}
          <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" /> Páginas Extraídas (
              {paginas.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2">
              {paginas.map((page) => {
                const isAnverso = page.orientacion
                  ? page.orientacion === "Anverso"
                  : page.pagina % 2 !== 0;
                const label = isAnverso ? "A" : "R";

                return (
                  <div
                    key={page.pagina}
                    onClick={() => setActivePage(page)}
                    className="group cursor-pointer aspect-[3/4] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all relative flex flex-col items-center justify-center p-4 text-center"
                  >
                    {/* A/R Badge */}
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                        isAnverso
                          ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                          : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
                      )}
                    >
                      {label}
                    </div>

                    <FileText className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Página {page.pagina}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {page.lineas?.length || 0} líneas
                    </span>

                    <div className="absolute inset-x-0 bottom-0 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center">
                        Ver Detalle <Maximize2 className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
