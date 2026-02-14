import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function StatusIndicator({ status, message }) {
  if (status === "idle") return null;

  const config = {
    uploading: {
      icon: <Loader2 className="w-6 h-6 animate-spin text-blue-500" />,
      color: "text-blue-500",
      title: "Subiendo Archivo...",
    },
    processing: {
      icon: <Loader2 className="w-6 h-6 animate-spin text-purple-500" />,
      color: "text-purple-500",
      title: "Procesando Documento...",
    },
    completed: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      color: "text-green-500",
      title: "Completado",
    },
    error: {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      color: "text-red-500",
      title: "Error",
    },
  };

  const current = config[status] || config.processing;

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6">
      <div className="shrink-0">{current.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${current.color}`}>
          {current.title}
        </p>
        <p className="text-sm text-slate-500 truncate dark:text-slate-400">
          {message || "Por favor espera..."}
        </p>
      </div>
    </div>
  );
}
