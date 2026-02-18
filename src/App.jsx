import React, { useState, useEffect } from "react";
import { LexiaLogo } from "./components/LexiaLogo";
import { Dropzone } from "./components/Dropzone";
import { PDFPreview } from "./components/PDFPreview";
import { StatusIndicator } from "./components/StatusIndicator";
import { ResultViewer } from "./components/ResultViewer";
import { SmartViewer } from "./components/SmartViewer";
import { RatingFeedback } from "./components/RatingFeedback";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { Button } from "./components/ui/button";
import { uploadDocument, pollJobStatus } from "./lib/api";
import { DocumentLibrary } from "./components/DocumentLibrary";
import {
  RefreshCcw,
  Moon,
  Sun,
  Layout,
  Code,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Menu,
  X,
  History,
} from "lucide-react";
import { supabase } from "./lib/supabase";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, processing, completed, error
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState("smart"); // 'smart' or 'json'
  const [history, setHistory] = useState([]);
  const [pdfPages, setPdfPages] = useState(6);
  const [useMock] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Auto dismiss status (from provided code edit)
  useEffect(() => {
    if (status === "completed" || status === "error") {
      // Changed 'complete' to 'completed' to match original status names
      const timer = setTimeout(() => setStatus("idle"), 5000); // Auto dismiss status
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchHistory = async (fileName) => {
    try {
      const { data, error } = await supabase
        .from("document_ratings")
        .select("*")
        .eq("pdf_name", fileName)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // Load from Local Storage on Mount
  useEffect(() => {
    const savedResult = localStorage.getItem("extractionResult");
    const savedFileName = localStorage.getItem("currentFileName");

    if (savedResult && savedFileName) {
      try {
        setResult(JSON.parse(savedResult));
        setFile({ name: savedFileName, size: 0 }); // Mock file object for UI display
        setStatus("completed");
        fetchHistory(savedFileName);
      } catch (e) {
        console.error("Failed to load from local storage", e);
      }
    }
  }, []);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
    setStatusMessage("");
    setExtractionResult(null);
    setError(null);
    setHistory([]);

    // Clear Local Storage for new file
    localStorage.removeItem("extractionResult");
    localStorage.removeItem("currentFileName");

    // Detect page count (simple heuristic)
    try {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;

        // 1. Try to find /Count in the Pages dictionary
        const countMatch = content.match(/\/Count\s+(\d+)/);
        if (countMatch && countMatch[1]) {
          const count = parseInt(countMatch[1]);
          if (count > 1 && count < 1000) {
            setPdfPages(count);
            return;
          }
        }

        // 2. Fallback: Count /Type /Page occurrences
        const pageMatches = content.match(/\/Type\s*\/Page\b/g);
        if (pageMatches && pageMatches.length > 2) {
          setPdfPages(pageMatches.length);
          return;
        }

        // 3. Fallback based on file size if detection failed
        if (selectedFile.size > 1024 * 1024) {
          setPdfPages(6);
        }
      };
      // Read a larger chunk (2MB)
      reader.readAsText(selectedFile.slice(0, 2000000));
    } catch (err) {
      console.error("Error detecting pages:", err);
    }

    fetchHistory(selectedFile.name);
  };

  const startProcessing = async () => {
    if (!file) return;

    setStatus("uploading");
    setStatusMessage("Subiendo archivo...");

    try {
      if (useMock) {
        // Added from provided code edit
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setStatus("processing");
        setStatusMessage("Analizando con IA..."); // Added from provided code edit
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock data loading...
        const mockData = {
          default: {
            extraction: {
              extracted_info: {
                paginas: [],
                comparecientes: [],
                comunicacional: {
                  contenido_periodistico: { tipo_contrato: "DEMO MOCK" },
                },
              },
            },
          },
        };
        setResult(mockData.default); // Keep original result state updated

        // Save to Local Storage
        localStorage.setItem(
          "extractionResult",
          JSON.stringify(mockData.default),
        );
        localStorage.setItem("currentFileName", file.name);

        setStatus("completed"); // Changed 'complete' to 'completed'
        setStatusMessage("Procesamiento completado exitosamente."); // Added from provided code edit
        fetchHistory(file.name); // Call fetchHistory after mock processing
      } else {
        const { jobId } = await uploadDocument(file);

        setStatus("processing");
        setStatusMessage(
          "Documento subido. Iniciando procesamiento OCR y extracción...",
        );

        // Poll
        const interval = setInterval(async () => {
          try {
            const job = await pollJobStatus(jobId);

            if (job.status === "completed") {
              clearInterval(interval);
              setStatus("completed");
              setStatusMessage("Procesamiento completado exitosamente.");
              setResult(job.result);

              // Save to Local Storage
              localStorage.setItem(
                "extractionResult",
                JSON.stringify(job.result),
              );
              localStorage.setItem("currentFileName", file.name);

              localStorage.setItem("currentFileName", file.name);

              const escrituraNo =
                job.result?.extraction?.extracted_info?.comunicacional
                  ?.contenido_periodistico?.numero_escritura ||
                job.result?.default?.extraction?.extracted_info?.comunicacional
                  ?.contenido_periodistico?.numero_escritura;

              if (escrituraNo) {
                fetchHistory(escrituraNo);
              } else {
                fetchHistory(file.name);
              }

              setTimeout(() => {
                setStatus("idle");
                setStatusMessage("");
              }, 3000);
            } else if (job.status === "failed") {
              clearInterval(interval);
              setStatus("error");
              setStatusMessage(job.error || "El procesamiento falló.");
            } else {
              // Update message if processing stage is available
              if (job.processingStage) {
                setStatusMessage(job.processingStage);
              }
            }
          } catch (err) {
            console.error("Polling error", err);
            clearInterval(interval);
            setStatus("error");
            setStatusMessage(err.message);
          }
        }, 2000);
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(err.message);
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setStatusMessage("");
    setHistory([]);

    localStorage.removeItem("extractionResult");
    localStorage.removeItem("currentFileName");
  };

  const handleSelectVersion = (versionData) => {
    // Added from provided code edit
    setResult(versionData.extracted_data); // Also update the original result state
  };

  const handleLoadDocument = (doc) => {
    // Restore state from document history item
    setFile({ name: doc.pdf_name, size: 0 }); // Mock file
    setResult(doc.extracted_data);
    setStatus("completed");

    // Fetch full history for this document
    if (doc.escritura_no) {
      fetchHistory(doc.escritura_no);
    } else {
      fetchHistory(doc.pdf_name);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      {/* Left Panel: Upload & Preview */}
      <div className="w-1/2 flex flex-col p-6 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LexiaLogo
              className="h-8 w-auto"
              mode={isDarkMode ? "dark" : "light"}
            />
            {file && (
              <div className="ml-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 max-w-[300px]">
                <FileText className="w-3 h-3 text-slate-500" />
                <span
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate"
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DocumentLibrary onLoadDocument={handleLoadDocument} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col">
          {file ? (
            <>
              <div className="flex-1 relative overflow-hidden rounded-lg shadow-sm mb-4">
                <PDFPreview file={file} />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={status === "processing" || status === "uploading"}
                >
                  Cancelar / Cambiar
                </Button>
                <Button
                  className="flex-1"
                  onClick={startProcessing}
                  disabled={
                    status === "processing" ||
                    status === "uploading" ||
                    status === "completed"
                  }
                >
                  {status === "completed"
                    ? "Procesado"
                    : "Iniciar Procesamiento"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <Dropzone onFileSelect={handleFileSelect} />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Status & Results */}
      <div className="w-1/2 flex flex-col p-6 bg-white dark:bg-slate-900/50">
        <div className="mb-2 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Resultados</h2>
          </div>
          {result && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("smart")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "smart" ? "bg-white dark:bg-slate-700 shadow" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
                title="Vista Inteligente"
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "json" ? "bg-white dark:bg-slate-700 shadow" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
                title="Vista JSON"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {status !== "idle" && (
          <StatusIndicator status={status} message={statusMessage} />
        )}

        {/* Rating System */}
        {result && (
          <div className="mb-4">
            <RatingFeedback
              fileName={file?.name || "documento_desconocido.pdf"}
              extractedData={result}
              escrituraNo={
                result.extraction?.extracted_info?.comunicacional
                  ?.contenido_periodistico?.numero_escritura ||
                result.default?.extraction?.extracted_info?.comunicacional
                  ?.contenido_periodistico?.numero_escritura
              }
            />
          </div>
        )}

        <div className="flex-1 min-h-0 relative">
          {status === "processing" ? (
            <SkeletonLoader totalPages={pdfPages} />
          ) : result ? (
            viewMode === "smart" ? (
              <SmartViewer
                data={result}
                history={history} // Pass history to SmartViewer
                onSelectVersion={handleSelectVersion} // Pass handler to SmartViewer
                className="h-full"
              />
            ) : (
              <ResultViewer data={result} className="h-full" />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <p className="text-sm">Esperando resultados...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
