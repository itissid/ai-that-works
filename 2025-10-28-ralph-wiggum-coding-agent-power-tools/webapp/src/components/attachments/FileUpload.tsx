"use client";

import { type ChangeEvent, useRef, useState } from "react";

interface FileUploadProps {
  todoId: string;
  onUploadSuccess?: () => void;
}

export default function FileUpload({
  todoId,
  onUploadSuccess,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("todoId", todoId);

      const response = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload file");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor={`file-upload-${todoId}`}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isUploading ? "Uploading..." : "📎 Add Attachment"}
        </label>
        <input
          ref={fileInputRef}
          id={`file-upload-${todoId}`}
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Max 10MB
        </span>
      </div>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
