import React, { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "../lib/utils";

export function Dropzone({ onFileSelect, className }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    validateAndPass(files);
  };

  const validateAndPass = (files) => {
    const file = files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Por favor, sube un archivo PDF válido.");
    }
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    validateAndPass(files);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed rounded-lg transition-colors cursor-pointer",
        isDragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <Upload className="w-12 h-12 mb-4 text-slate-400" />
        <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-300">
          <span className="font-semibold">Haz clic para subir</span> o arrastra
          y suelta
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          PDF (MAX. 10MB)
        </p>
      </div>
    </div>
  );
}
