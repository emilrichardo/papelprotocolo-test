import React from "react";
import { Check, Copy, FileText } from "lucide-react";
import { Button } from "./ui/button";

export function ResultViewer({ data, className }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Datos Extraídos
        </h3>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" /> Copiar JSON
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-inner">
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
