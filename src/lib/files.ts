import { Attachment } from "@/types";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB cap per file
const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const DOCUMENT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
]);

export class FileValidationError extends Error {}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function processFile(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileValidationError(
      `"${file.name}" exceeds the 8MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`
    );
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isDoc = DOCUMENT_TYPES.has(file.type);

  if (!isImage && !isDoc) {
    throw new FileValidationError(
      `"${file.name}" has an unsupported type (${file.type || "unknown"}). Allowed: PNG, JPEG, WEBP, GIF, TXT, MD, CSV, JSON, PDF.`
    );
  }

  const dataUrl = await fileToDataUrl(file);

  return {
    id: nanoid(8),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    dataUrl,
    kind: isImage ? "image" : "document",
  };
}

export async function processFiles(files: FileList | File[]): Promise<{
  attachments: Attachment[];
  errors: string[];
}> {
  const list = Array.from(files);
  const attachments: Attachment[] = [];
  const errors: string[] = [];

  for (const file of list) {
    try {
      attachments.push(await processFile(file));
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Unknown file error.");
    }
  }

  return { attachments, errors };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
