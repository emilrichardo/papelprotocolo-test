import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Maximize2,
  RotateCw,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  History,
  LayoutList,
  AlignLeft,
  FileStack,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function SmartViewer({
  data,
  className,
  history = [],
  onSelectVersion,
}) {
  const [activePage, setActivePage] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [orientationOverrides, setOrientationOverrides] = useState({});
  const [copied, setCopied] = useState(false);

  // Refs for scrolling
  const pageRefs = useRef({});
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  // Safe initialization of data

  const info = React.useMemo(() => {
    if (!data) return {};
    // Support new format: data might be the result object (passed from App.js)
    const extraction =
      data.extraction || data.result?.extraction || data.result?.raw_extraction;
    if (extraction) {
      return extraction.extracted_info || extraction;
    }
    return data || {};
  }, [data]);

  const paginas = React.useMemo(
    () =>
      info.paginas_extaidas ||
      info.paginas_extraidas ||
      info.paginas_escritura ||
      info.paginas ||
      info.paginas_escaneadas ||
      [],
    [info],
  );

  // Robust comparecientes extraction
  const comparecientes = React.useMemo(() => {
    const raw =
      info.comparecientes?.comparecientes ||
      info.Comparecientes?.Comparecientes ||
      info.comparecientes ||
      info.Comparecientes ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [info]);

  // Merge metadata from root info and specific subsection to ensure all fields are captured
  // Helper to find key case-insensitively or with variations
  // Helper to find key case-insensitively or with variations
  const getValue = (keys) => {
    for (const key of keys) {
      // Handle dot notation like "comunicacional.titulo"
      if (key.includes(".")) {
        const parts = key.split(".");
        let val = info;
        for (const part of parts) {
          val = val?.[part] || val?.[part.toLowerCase()]; // Try lowercase too just in case
        }
        if (val) return val;
      }

      // 1. Check root info
      if (info[key]) return info[key];

      // 2. Check metadata (new structure)
      if (info.metadata?.[key]) return info.metadata[key];

      // 3. Check documento_metadata (legacy)
      if (info.documento_metadata?.[key]) return info.documento_metadata[key];

      // 4. Check comunicacional root (new requirement)
      if (info.comunicacional?.[key]) return info.comunicacional[key];

      // 5. Last resort: comunicacional.contenido_periodistico
      if (info.comunicacional?.contenido_periodistico?.[key])
        return info.comunicacional.contenido_periodistico[key];
    }
    return null;
  };

  const metadata = {
    numero_escritura: getValue([
      "numero_escritura",
      "Numero_escritura",
      "Escritura_No",
      "No_escritura",
    ]),
    fecha_escritura: getValue([
      "fecha_escritura",
      "Fecha_escritura",
      "Fecha",
      "fecha",
    ]),
    lugar_escritura_publica: getValue([
      "lugar_escritura_publica",
      "Lugar_escritura_publica",
      "Lugar",
      "lugar",
    ]),
    estado_escritura_publica: getValue([
      "estado_escritura_publica",
      "Estado_escritura_publica",
      "Estado",
    ]),
    nombre_de_abogado: getValue([
      "nombre_de_abogado",
      "Nombre_de_abogado",
      "Nombre_notario",
      "Notario",
    ]),
    vencimiento_escritura_publica: getValue([
      "vencimiento_escritura_publica",
      "Vencimiento_escritura_publica",
      "Vencimiento",
    ]),
    ano_escritura_publica: getValue([
      "ano_escritura_publica",
      "Ano_escritura_publica",
      "Ano",
      "Agno",
    ]),
    tipo_contrato: getValue([
      "comunicacional.titulo",
      "descripcion_tipo_contrato",
      "Tipo_contrato",
      "titulo",
    ]),
    resumen: getValue([
      "comunicacional.resumen",
      "resumen de dos lineas",
      "Resumen",
      "resumen",
    ]),
  };

  // Scroll to active page when entering view
  useEffect(() => {
    if (
      activePage &&
      !isProgrammaticScroll.current &&
      pageRefs.current[activePage.pagina]
    ) {
      isProgrammaticScroll.current = true;
      pageRefs.current[activePage.pagina].scrollIntoView({
        behavior: "auto",
        block: "start",
      });
      // Small timeout to re-enable observer updates
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  }, [activePage]); // Trigger only on activePage change

  // Intersection Observer to track active page during scroll
  useEffect(() => {
    if (!activePage || !containerRef.current) return;

    const options = {
      root: containerRef.current,
      rootMargin: "-40% 0px -40% 0px", // Trigger when page is in middle 20% of screen
      threshold: 0.1,
    };

    const handleIntersect = (entries) => {
      if (isProgrammaticScroll.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute("data-page"));
          const foundPage = paginas.find((p) => p.pagina === pageNum);
          if (foundPage && foundPage.pagina !== activePage.pagina) {
            setActivePage(foundPage);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    Object.values(pageRefs.current).forEach((el) => {
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activePage, paginas]);

  // Check for valid data AFTER hooks are declared
  const hasValidData =
    data &&
    ((data.extraction &&
      (data.extraction.extracted_info ||
        data.extraction.paginas_escritura ||
        data.extraction.paginas_extaidas ||
        data.extraction.paginas_extraidas ||
        data.extraction.paginas_escaneadas ||
        data.extraction.paginas)) ||
      data.result?.extraction ||
      data.paginas_escritura ||
      data.paginas);

  if (!hasValidData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500">
        <p>Formato de datos no reconocido para visualización inteligente.</p>
        <pre className="mt-4 p-4 bg-slate-100 rounded text-xs overflow-auto max-w-full">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOrientation = () => {
    if (!activePage) return;
    const currentOrient = getPageOrientation(
      activePage,
      paginas.indexOf(activePage),
    );
    const newOrient = currentOrient === "Anverso" ? "Reverso" : "Anverso";

    setOrientationOverrides((prev) => ({
      ...prev,
      [activePage.pagina]: newOrient,
    }));
  };

  const getPageOrientation = (page, index) => {
    if (orientationOverrides[page.pagina])
      return orientationOverrides[page.pagina];

    // Force strict alternation based on index:
    // Index 0 -> Anverso, Index 1 -> Reverso, Index 2 -> Anverso, etc.
    // This overrides any 'orientacion' property from JSON to prevent duplicate types in sequence.
    return index % 2 === 0 ? "Anverso" : "Reverso";
  };

  return (
    <div className={cn("flex flex-col h-full gap-6", className)}>
      {/* Content Area: Either Grid or Detail View */}
      {activePage ? (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Toolbar Header (Navigation) */}
          <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePage(null)}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4 rotate-90" /> Volver
              </Button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleOrientation}
                className="text-xs gap-2 text-slate-500 hover:text-blue-600"
                title="Cambiar Orientación de la página actual"
              >
                <RotateCw className="w-3 h-3" />
                {getPageOrientation(activePage)}
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
                  if (idx > 0) {
                    const prevPage = paginas[idx - 1];
                    setActivePage(prevPage);
                    // Manual scroll triggers
                    isProgrammaticScroll.current = true;
                    pageRefs.current[prevPage.pagina]?.scrollIntoView({
                      block: "start",
                      behavior: "smooth",
                    });
                    setTimeout(() => {
                      isProgrammaticScroll.current = false;
                    }, 500);
                  }
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
                  if (idx < paginas.length - 1) {
                    const nextPage = paginas[idx + 1];
                    setActivePage(nextPage);
                    // Manual scroll triggers
                    isProgrammaticScroll.current = true;
                    pageRefs.current[nextPage.pagina]?.scrollIntoView({
                      block: "start",
                      behavior: "smooth",
                    });
                    setTimeout(() => {
                      isProgrammaticScroll.current = false;
                    }, 500);
                  }
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scrolled Content - Continuous Vertical List */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto bg-slate-200/50 dark:bg-slate-950/50 relative p-4 md:py-8 space-y-8 scroll-smooth"
          >
            {paginas.map((page, pIdx) => {
              const orientation = getPageOrientation(page, pIdx);
              const isAnverso = orientation === "Anverso";
              const displayPageNum = page.pagina || pIdx + 1;

              return (
                <div
                  key={pIdx}
                  data-page={page.pagina}
                  ref={(el) => (pageRefs.current[page.pagina] = el)}
                  className="flex justify-center min-h-[1000px]"
                >
                  <div className="bg-[#fcfbf9] dark:bg-[#1a1a1a] w-full max-w-[800px] shadow-2xl relative px-8 py-12 md:px-12 md:py-16 text-slate-800 dark:text-slate-200 font-['Courier_Prime'] border border-slate-200 dark:border-slate-800/50">
                    {/* Visual Page Number Indicator (outside paper) */}
                    <div className="absolute top-4 right-[-3rem] hidden xl:block text-slate-400 font-sans text-xs -rotate-90 origin-left opacity-50">
                      Pág. {displayPageNum}
                    </div>

                    {/* Header */}
                    {isAnverso ? (
                      <div className="relative mb-12">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-24 h-24 rounded-full border-4 border-double border-red-800/20 dark:border-red-500/20 flex items-center justify-center opacity-50">
                            <div className="text-[10px] text-center font-serif text-red-900/40 dark:text-red-500/40 font-bold leading-tight">
                              REPUBLICA
                              <br />
                              DE
                              <br />
                              GUATEMALA
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="border-2 border-slate-800 dark:border-slate-500 px-4 py-2 min-w-[200px] flex justify-between items-center bg-white dark:bg-slate-900/50 mb-2">
                              <span className="font-serif text-2xl font-bold">
                                No.
                              </span>
                              <span className="font-mono text-xl text-red-700 dark:text-red-400 font-bold tracking-widest">
                                {metadata.numero_escritura || "982166"}
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
                      <div className="relative mb-8 flex justify-center">
                        <div className="border-4 border-double border-slate-700 dark:border-slate-500 px-8 py-3 flex items-center gap-12 bg-white dark:bg-slate-900/50">
                          <span className="font-mono text-xl text-slate-700 dark:text-slate-300 font-bold tracking-widest">
                            {metadata.numero_escritura || "982166"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Margins */}
                    <div className="absolute top-0 bottom-0 left-[3.5rem] w-px bg-red-500/20 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-[2rem] w-px bg-red-500/20 pointer-events-none" />

                    {/* Lines */}
                    <div className="relative z-0 leading-[2.6rem] tracking-tighter text-justify">
                      {(() => {
                        // Prepare 25 slots
                        const slots = Array.from({ length: 25 }, () => null);
                        const renglones =
                          page.renglones ||
                          page.lineas ||
                          page.cuerpo?.lineas ||
                          [];

                        let nextAvailableSlot = 0;
                        renglones.forEach((r) => {
                          let slotIndex = -1;
                          const indicator =
                            r.indicador_renglon || r.numero_linea;

                          if (indicator) {
                            const L = parseInt(indicator);
                            if (!isNaN(L)) {
                              // Standard protocol paper has 25 lines per side.
                              // indicator 1-25 -> slot 0-24
                              // indicator 26-50 -> slot 0-24 (reverso)
                              // Generalizing: (L - 1) % 25
                              slotIndex = (L - 1) % 25;
                            }
                          }

                          if (
                            slotIndex !== -1 &&
                            slotIndex >= 0 &&
                            slotIndex < 25
                          ) {
                            slots[slotIndex] = r;
                            // Update nextAvailableSlot to follow this one
                            nextAvailableSlot = slotIndex + 1;
                          } else {
                            // No indicator or invalid, put in next available slot
                            if (nextAvailableSlot < 25) {
                              // Only fill if slot is empty, otherwise find next truly empty
                              while (
                                nextAvailableSlot < 25 &&
                                slots[nextAvailableSlot] !== null
                              ) {
                                nextAvailableSlot++;
                              }
                              if (nextAvailableSlot < 25) {
                                slots[nextAvailableSlot] = r;
                                nextAvailableSlot++;
                              }
                            }
                          }
                        });

                        return slots.map((lineData, idx) => {
                          let content =
                            lineData?.contenido || lineData?.texto_original;

                          if (content && comparecientes.length > 0) {
                            const names = comparecientes
                              .map(
                                (c) =>
                                  c.compareciente
                                    ?.Nombre_completo_compadeciente ||
                                  c.Nombre_completo_compadeciente ||
                                  c.Nombre,
                              )
                              .filter(Boolean);
                            if (names.length > 0) {
                              const escapedNames = names.map((name) =>
                                name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                              );
                              const pattern = new RegExp(
                                `(${escapedNames.join("|")})`,
                                "gi",
                              );
                              const parts = String(content).split(pattern);
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

                          // Calculate the display line indicator
                          // If r.indicador_renglon exists, use it.
                          // Otherwise fallback to logical numbering
                          const displayIndicator =
                            lineData?.indicador_renglon ||
                            lineData?.numero_linea ||
                            (isAnverso ? idx + 1 : idx + 26);

                          return (
                            <div
                              key={idx}
                              className="relative border-b border-cyan-200/50 dark:border-cyan-800/30 flex items-baseline h-[2.6rem] w-full group/line"
                            >
                              <span className="absolute left-[-2.5rem] w-8 text-sm text-slate-400 dark:text-slate-600 font-sans select-none text-right flex items-center justify-end h-full pr-2">
                                {displayIndicator}
                              </span>
                              <div
                                className={cn(
                                  "w-full px-1 group-hover/line:bg-blue-50/10 transition-colors uppercase whitespace-nowrap overflow-hidden text-ellipsis",
                                  !lineData && "opacity-0",
                                )}
                                style={{ fontSize: "0.75em" }}
                              >
                                {content}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Footer Stamp */}
                    <div className="mt-12 flex justify-center opacity-80 rotate-[-2deg] pointer-events-none select-none">
                      <div className="border-4 border-blue-800 dark:border-blue-400 rounded-full px-6 py-2 inline-block">
                        <div className="text-blue-800 dark:text-blue-400 font-bold font-serif text-lg uppercase tracking-widest">
                          FIRMADO
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2",
                activeTab === "general"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300",
              )}
            >
              <LayoutList className="w-4 h-4" />
              General
            </button>

            <button
              onClick={() => setActiveTab("texto")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2",
                activeTab === "texto"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300",
              )}
            >
              <AlignLeft className="w-4 h-4" />
              Texto
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Header / Metadata */}
                {metadata && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {metadata.tipo_contrato || "Documento Protocolar"}
                        </h2>

                        {/* Version Selector */}
                        {history && history.length > 0 && (
                          <div className="relative group">
                            <select
                              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs py-1 pl-7 pr-8 rounded-full text-slate-600 dark:text-slate-300 cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              onChange={(e) => {
                                const selected = history.find(
                                  (h) => h.id.toString() === e.target.value,
                                );
                                if (selected) onSelectVersion(selected);
                              }}
                            >
                              <option value="" disabled selected>
                                Historial ({history.length})
                              </option>
                              {history.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {new Date(
                                    item.created_at,
                                  ).toLocaleDateString()}{" "}
                                  - {item.rating || "?"}★{" "}
                                  {item.comment ? "📝" : ""}
                                </option>
                              ))}
                            </select>
                            <History className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyHash}
                        className="h-6 w-6 ml-2"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    {/* Key Value Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 text-xs bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Escritura No.
                        </span>
                        <span className="font-mono text-slate-900 dark:text-slate-200 font-medium text-base">
                          {metadata.numero_escritura || "--"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Fecha
                        </span>
                        <span className="text-slate-900 dark:text-slate-200 font-medium">
                          {metadata.fecha_escritura || "--"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Lugar
                        </span>
                        <span className="text-slate-900 dark:text-slate-200 font-medium">
                          {metadata.lugar_escritura_publica || "--"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Estado
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                            metadata.estado_escritura_publica === "FIRMADA"
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                              : "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                          )}
                        >
                          {metadata.estado_escritura_publica || "BORRADOR"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                          Notario
                        </span>
                        <span className="text-slate-900 dark:text-slate-200 font-medium">
                          {metadata.nombre_de_abogado || "--"}
                        </span>
                      </div>
                      {metadata.vencimiento_escritura_publica &&
                        metadata.vencimiento_escritura_publica !== "null" && (
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                              Vencimiento
                            </span>
                            <span className="text-slate-900 dark:text-slate-200 font-medium">
                              {metadata.vencimiento_escritura_publica}
                            </span>
                          </div>
                        )}
                      {metadata.ano_escritura_publica && (
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                            Año
                          </span>
                          <span className="text-slate-900 dark:text-slate-200 font-medium">
                            {metadata.ano_escritura_publica}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 italic">
                      {metadata.resumen}
                    </p>
                  </div>
                )}

                {/* Comparecientes */}
                {comparecientes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <User className="w-4 h-4" /> Comparecientes (
                      {comparecientes.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {comparecientes.map((item, idx) => {
                        const c = item.compareciente || item;
                        return (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg flex items-start justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {c.Nombre_completo_compadeciente ||
                                  c.Nombre ||
                                  c.nombre ||
                                  "Nombre desconocido"}
                              </p>
                              {(c.Rol_compadeciente || c.Rol || c.rol) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold  text-white border border-blue-200   mb-2">
                                  {c.Rol_compadeciente || c.Rol || c.rol}
                                </span>
                              )}

                              {/* Additional Details: Calidad & Entidad */}
                              {(c.Calidad_compadeciente || c.calidad) && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-0.5">
                                  <span className="font-semibold text-slate-500 dark:text-slate-500">
                                    Calidad:
                                  </span>{" "}
                                  {c.Calidad_compadeciente || c.calidad}
                                </p>
                              )}
                              {(c.Nombre_persona_juridica ||
                                c.representacion) && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                  <span className="font-semibold text-slate-500 dark:text-slate-500">
                                    Entidad:
                                  </span>{" "}
                                  {c.Nombre_persona_juridica ||
                                    c.representacion}
                                </p>
                              )}

                              {(c.Id_doc_identificacion ||
                                c.DPI ||
                                c.Identificacion) && (
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                  {c.Tipo_doc_identificacion || "ID"}:{" "}
                                  {c.Id_doc_identificacion ||
                                    c.DPI ||
                                    c.Identificacion}
                                </p>
                              )}
                            </div>
                            {(c.Edad_compadeciente || c.Edad || c.edad) && (
                              <span className="text-xs font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700">
                                {c.Edad_compadeciente || c.Edad || c.edad} Años
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Pages List within General Tab */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <FileStack className="w-4 h-4" /> Páginas ({paginas.length})
                  </h3>
                  <div className="flex flex-col gap-3 pb-4">
                    {paginas.map((page, idx) => {
                      const orientation = getPageOrientation(page, idx);

                      const displayPageNum = idx + 1;
                      const renglonesCount =
                        page.renglones?.length ||
                        page.lineas?.length ||
                        page.cuerpo?.lineas?.length ||
                        0;

                      return (
                        <div
                          key={page.pagina || idx}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm relative flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <div className="w-12 h-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center">
                                <FileText className="w-6 h-6 text-slate-300" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                  {page.pagina_protocolo
                                    ? `Protocolo: ${page.pagina_protocolo}`
                                    : `Página ${displayPageNum}`}
                                </span>
                                {page.folio !== null &&
                                  page.folio !== undefined && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                      Folio: {page.folio}
                                    </span>
                                  )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="capitalize">
                                  {page.orientacion || orientation}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span>{renglonesCount} renglones</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "texto" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {info.texto_extraido || info.extracted_text ? (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-inner">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {info.texto_extraido || info.extracted_text}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay texto extraído disponible.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
