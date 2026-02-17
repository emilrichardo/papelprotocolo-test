import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, BrainCircuit } from "lucide-react";

const mensajesProtocolo = [
  "El papel protocolo es el soporte físico exclusivo donde los notarios autorizan actos y contratos legales.",
  "Cada hoja de protocolo está diseñada con 50 renglones exactos para garantizar la integridad del texto.",
  "¿Sabías que el anverso contiene los renglones del 1 al 25 y el reverso del 26 al 50?",
  "Los elementos como el 'Quinquenio' y el 'Número de Registro' aseguran la validez y control del papel notarial.",
  "La numeración en los márgenes izquierdos sirve como ancla visual para la validez de cada línea de texto legal.",
  "El papel protocolo es un documento de seguridad que garantiza la conservación permanente de los contratos.",
  "Estamos identificando los hitos de inicio y fin para extraer solo la narrativa legal importante.",
  "Procesando firmas y sellos: recordá que el cierre legal suele contener la frase obligatoria 'DOY FE'.",
  "El número de serie y el escudo nacional en el papel protocolo son medidas críticas contra la falsificación.",
];

export function StatusIndicator({ status, message }) {
  const [currentThought, setCurrentThought] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Cycle through messages when processing
  useEffect(() => {
    if (status !== "processing") return;

    const targetMessage = mensajesProtocolo[msgIndex];

    if (isTyping) {
      if (charIndex < targetMessage.length) {
        const timeout = setTimeout(() => {
          setCurrentThought((prev) => prev + targetMessage[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 30); // Typing speed
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait before next message
        const timeout = setTimeout(() => {
          // Clear and advance to next message
          setCurrentThought("");
          setCharIndex(0);
          setMsgIndex((prev) => (prev + 1) % mensajesProtocolo.length);
        }, 3000); // Wait time to read
        return () => clearTimeout(timeout);
      }
    }
  }, [status, charIndex, msgIndex, isTyping]);

  if (status === "idle") return null;

  const config = {
    uploading: {
      icon: <Loader2 className="w-6 h-6 animate-spin text-blue-500" />,
      color: "text-blue-500",
      title: "Subiendo Archivo...",
    },
    processing: {
      icon: <BrainCircuit className="w-6 h-6 animate-pulse text-purple-500" />,
      color: "text-purple-500",
      title: "Analizando Documento...",
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
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mb-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="shrink-0">{current.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${current.color}`}>
            {current.title}
          </p>
          {status !== "processing" && (
            <p className="text-sm text-slate-500 truncate dark:text-slate-400">
              {message || "Por favor espera..."}
            </p>
          )}
        </div>
      </div>

      {status === "processing" && (
        <div className="pl-9 mt-1">
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800 min-h-[40px] flex items-center">
            <span className="mr-2">ai_agent &gt;</span>
            {currentThought}
            <span className="animate-pulse ml-0.5">_</span>
          </p>
        </div>
      )}
    </div>
  );
}
