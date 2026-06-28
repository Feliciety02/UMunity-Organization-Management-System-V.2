"use client";

import { useRef, useState, useCallback, type DragEvent } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload({
  onFiles,
  accept,
  multiple,
  maxSize,
  className,
}: {
  onFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (incoming: FileList) => {
      const list = Array.from(incoming);
      const filtered = maxSize ? list.filter((f) => f.size <= maxSize) : list;
      setFiles(filtered);
      onFiles?.(filtered);
    },
    [maxSize, onFiles],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const removeFile = useCallback(
    (i: number) => {
      const next = files.filter((_, idx) => idx !== i);
      setFiles(next);
      onFiles?.(next);
    },
    [files, onFiles],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50",
        )}
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-foreground">
            Drop files here or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {accept ? `Supports ${accept}` : "Any file type"}
            {maxSize ? ` · Max ${Math.round(maxSize / 1024 / 1024)}MB` : null}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
