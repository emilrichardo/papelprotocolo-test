import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { History, FileText, Star, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";

export function DocumentLibrary({ onLoadDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Fetch all ratings to group them
      // In a real app, you might want a separate 'documents' table or use a view
      const { data, error } = await supabase
        .from("document_ratings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by distinct document (preferring escritura_no, then pdf_name)
      // This is a client-side grouping because supabase distinct on specific columns with latest entry is tricky without RPC
      const groupedMap = new Map();

      data.forEach((item) => {
        // Try to get escritura_no from column OR from nested JSON
        let escrituraNo = item.escritura_no;
        if (!escrituraNo && item.extracted_data) {
          escrituraNo =
            item.extracted_data?.extraction?.extracted_info?.comunicacional
              ?.contenido_periodistico?.numero_escritura ||
            item.extracted_data?.default?.extraction?.extracted_info
              ?.comunicacional?.contenido_periodistico?.numero_escritura;
        }

        const key = escrituraNo ? `escritura_${escrituraNo}` : item.pdf_name;

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            ...item,
            escritura_no: escrituraNo, // Normalize it in the view object
            versions: 1,
            history: [item],
          });
        } else {
          const doc = groupedMap.get(key);
          doc.versions += 1;
          doc.history.push(item);
        }
      });

      setDocuments(Array.from(groupedMap.values()));
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" title="Historial de Documentos">
          <History className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Biblioteca de Documentos
          </SheetTitle>
          <SheetDescription>
            Historial de documentos analizados y sus calificaciones.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg">
                No hay documentos registrados aún.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => {
                    onLoadDocument(doc);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4
                          className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[200px]"
                          title={doc.pdf_name}
                        >
                          {doc.pdf_name}
                        </h4>
                        {doc.escritura_no && (
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-2">
                            Escritura #{doc.escritura_no}
                          </span>
                        )}
                      </div>
                    </div>
                    {doc.rating > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {doc.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                      {doc.versions > 1 && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                          {doc.versions} versiones
                        </span>
                      )}
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                      Abrir
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
