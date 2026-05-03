"use client";

import { useState } from "react";
import { PlatformSelector } from "@/components/upload/PlatformSelector";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { CSVPreview } from "@/components/upload/CSVPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Upload, ArrowRight, Database, ChevronLeft, ChevronRight } from "lucide-react";

interface UploadResult {
  datasetName: string;
  rowsProcessed: number;
  columns?: string[];
  nullsCleaned: number;
}

export default function UploadPage() {
  const [step, setStep] = useState<"platform" | "drop" | "preview" | "done">("platform");
  const [platform, setPlatform] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleUpload = async () => {
    if (!file || !platform) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("platform", platform);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult(data as UploadResult);
      setStep("done");
      toast.success("Data uploaded and analyzed successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setStep("platform");
    setPlatform(null);
    setFile(null);
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
          <p className="text-muted-foreground">Follow the steps to ingest your marketing campaign data.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { key: "platform", label: "1", title: "Platform" },
            { key: "drop", label: "2", title: "File" },
            { key: "preview", label: "3", title: "Preview" },
            { key: "done", label: "4", title: "Done" },
          ].map((s, i) => {
            const steps = ["platform", "drop", "preview", "done"];
            const currentIdx = steps.indexOf(step);
            const stepIdx = steps.indexOf(s.key);
            const isActive = step === s.key;
            const isPast = stepIdx < currentIdx;

            return (
              <div key={s.key} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                    isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg" :
                    isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPast ? <CheckCircle2 size={16} /> : s.label}
                </div>
                <span className={`hidden lg:block text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
                {i < 3 && (
                  <div className={`w-4 md:w-8 h-0.5 rounded-full ${isPast ? "bg-primary/30" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === "platform" && (
        <div className="space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold">Select Platform</h2>
            <p className="text-sm text-muted-foreground">Which platform did you export this data from?</p>
          </div>
          <PlatformSelector 
            selectedPlatform={platform} 
            onSelect={(id) => {
              setPlatform(id);
              setStep("drop");
            }} 
          />
        </div>
      )}

      {step === "drop" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep("platform")} className="rounded-full gap-2">
              <ChevronLeft size={16} /> Back to Platform
            </Button>
            {file && (
              <Button onClick={() => setStep("preview")} className="rounded-full gap-2">
                Continue <ChevronRight size={16} />
              </Button>
            )}
          </div>
          <FileDropzone
            selectedFile={file}
            onFileSelect={(f) => {
              setFile(f);
              if (f) setStep("preview");
            }}
          />
        </div>
      )}

      {step === "preview" && file && (
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Database size={24} className="text-primary" />
                  Review & Confirm
                </CardTitle>
                <CardDescription>Confirm your {platform} data looks correct before processing.</CardDescription>
              </div>
              <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary">
                {platform?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="rounded-2xl border overflow-hidden">
              <CSVPreview file={file} />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep("drop")} className="rounded-full px-6">
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="rounded-full px-12 gap-2 h-12 text-lg shadow-lg shadow-primary/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Ingest Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && result && (
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden text-center py-16 bg-muted/20">
          <CardContent className="space-y-8">
            <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={56} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Data Ingested!</h2>
              <p className="text-muted-foreground text-lg">
                <span className="font-semibold text-foreground">{result.datasetName}</span> has been analyzed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-3xl bg-white shadow-sm border border-muted/50">
                <p className="text-3xl font-bold">{result.rowsProcessed}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Rows Processed</p>
              </div>
              <div className="p-6 rounded-3xl bg-white shadow-sm border border-muted/50">
                <p className="text-3xl font-bold text-primary">Meta</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Platform</p>
              </div>
              <div className="p-6 rounded-3xl bg-white shadow-sm border border-muted/50">
                <p className="text-3xl font-bold text-green-600">Success</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Status</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button variant="outline" onClick={handleReset} className="rounded-full px-8 h-12">
                Upload Another Platform
              </Button>
              <Button onClick={() => window.location.href = "/dashboard"} className="rounded-full gap-2 px-10 h-12 text-lg shadow-lg shadow-primary/20">
                <ArrowRight size={20} /> Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
