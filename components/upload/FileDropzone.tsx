"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileDropzone({ onFileSelect, selectedFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all min-h-[300px] cursor-pointer relative",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 bg-background",
        selectedFile && "border-primary/50 bg-primary/5"
      )}
      onClick={() => !selectedFile && document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
      />
      {selectedFile ? (
        <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <FileText size={32} />
          </div>
          <p className="font-semibold text-lg mb-1">{selectedFile.name}</p>
          <p className="text-sm text-muted-foreground mb-6">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onFileSelect(null)}
            className="rounded-full gap-2"
          >
            <X size={14} /> Remove File
          </Button>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-center">Tap to Upload or Drag & Drop</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-xs">
            Supported formats: CSV. Max 10MB.
          </p>
          <Button className="rounded-full px-8 pointer-events-none">
            Browse Files
          </Button>
        </>
      )}
    </div>
  );
}
