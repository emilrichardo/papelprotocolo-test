import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  Save,
  MessageSquare,
  Loader2,
  Send,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export function RatingFeedback({ fileName, extractedData, className }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const handleRating = (value) => {
    if (!submitted) setRating(value);
  };

  const submitRating = async () => {
    if (rating === 0) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("document_ratings").insert([
        {
          pdf_name: fileName,
          rating: rating,
          is_approved: isApproved,
          comment: comment,
          extracted_data: extractedData,
        },
      ]);

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 2000); // Auto close after success
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Error al guardar la calificación");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !submitted) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={cn("gap-2 bg-white dark:bg-slate-900 shadow-sm", className)}
      >
        <MessageSquare className="w-4 h-4" />
        Calificar Extracción
      </Button>
    );
  }

  if (submitted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-green-600 dark:text-green-400 cursor-default"
      >
        <CheckCircle className="w-4 h-4" />
        ¡Gracias por tu feedback!
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xl absolute z-50 w-[300px] right-0 top-10 animate-in fade-in zoom-in-95 duration-200",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Calificar
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <span className="sr-only">Cerrar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Star Rating */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300 dark:text-slate-600",
                )}
              />
            </button>
          ))}
        </div>

        {/* Approval Toggle */}
        <div
          className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-md cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          onClick={() => setIsApproved(!isApproved)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                isApproved
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600",
              )}
            >
              {isApproved && <Check className="w-3 h-3" />}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Aprobar documento
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div className="space-y-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentario (opcional)..."
            className="w-full text-xs p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[60px] resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitRating}
          disabled={rating === 0 || loading}
          className="w-full"
          size="sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Enviar
        </Button>
      </div>
    </div>
  );
}
