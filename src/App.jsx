import React, { useState, useEffect } from "react";
import { Dropzone } from "./components/Dropzone";
import { PDFPreview } from "./components/PDFPreview";
import { StatusIndicator } from "./components/StatusIndicator";
import { ResultViewer } from "./components/ResultViewer";
import { SmartViewer } from "./components/SmartViewer";
import { Button } from "./components/ui/button";
import { uploadDocument, pollJobStatus } from "./lib/api";
import { RefreshCcw, Moon, Sun, Layout, Code } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, processing, completed, error
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState("smart"); // 'smart' or 'json'

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
    setStatusMessage("");
  };

  const startProcessing = async () => {
    if (!file) return;

    setStatus("uploading");
    setStatusMessage("Subiendo archivo...");

    try {
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
        }
      }, 2000);
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
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      {/* Left Panel: Upload & Preview */}
      <div className="w-1/2 flex flex-col p-6 border-r border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lexia <span className="text-blue-600">Protocolo</span>
          </h1>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Resultados</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aquí verás el estado del proceso y la información extraída.
            </p>
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

        <div className="flex-1 min-h-0 relative">
          {result ? (
            viewMode === "smart" ? (
              <SmartViewer data={result} className="h-full" />
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
