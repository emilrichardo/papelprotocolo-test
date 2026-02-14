import React, { useState } from "react";
import { Star, CheckCircle, Save } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export function RatingFeedback({ fileName, extractedData, className }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0 && !isApproved) {
      setError("Por favor califica o aprueba el documento.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("document_ratings")
        .insert([
          {
            pdf_name: fileName,
            rating: rating > 0 ? rating : null,
            is_approved: isApproved,
            extracted_data: extractedData,
          },
        ]);

      if (dbError) throw dbError;

      setIsSubmitted(true);
      // Reset after a delay or keep it shown? user preference usually 'keep shown' to indicate success
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Error al guardar. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3 animate-in fade-in",
          className,
        )}
      >
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-300">
          ¡Gracias! Calificación guardada exitosamente.
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Rating Stars */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Calidad de Extracción
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
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
        </div>

        {/* Approval Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md border border-slate-100 dark:border-slate-800">
          <div className="flex items-center h-5">
            <input
              id="approved-checkbox"
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
          </div>
          <label
            htmlFor="approved-checkbox"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            Aprobado
          </label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (rating === 0 && !isApproved)}
          size="sm"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            "Guardando..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enviar Feedback
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
