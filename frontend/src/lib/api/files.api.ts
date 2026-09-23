import { api, buildQuery } from "./client";
import type { UploadedFile } from "../../types/api";

/** Buckets MinIO autorisés. Le client ne choisit jamais le chemin (§19). */
export type UploadBucket =
  | "products"
  | "avatars"
  | "seller-documents"
  | "payment-proofs";

export interface UploadRulesResponse {
  products: { accept: string; maxSizeMb: number };
  avatars: { accept: string; maxSizeMb: number };
  "seller-documents": { accept: string; maxSizeMb: number };
  "payment-proofs": { accept: string; maxSizeMb: number };
}

export const filesApi = {
  rules: () => api.get<UploadRulesResponse>("/files/rules"),

  
  upload: (bucket: UploadBucket, file: File) => {
    const form = new FormData();
    form.append("bucket", bucket);
    form.append("file", file);
    // Pas de `Content-Type` manuel : le navigateur pose la boundary multipart.
    return api.post<UploadedFile>("/files/upload", undefined, { body: form });
  },

  remove: (bucket: UploadBucket, objectKey: string) =>
    api.delete<void>("/files" + buildQuery({ bucket, objectKey })),

  presignedUrl: (bucket: UploadBucket, objectKey: string) =>
    api.get<{ url: string }>("/files/presigned-url" + buildQuery({ bucket, objectKey })),
};
