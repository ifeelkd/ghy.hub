import { createClient } from "./client";
import { optimizeImage, OptimizedImageResult } from "../image-optimizer";

export interface UploadResult {
  url: string;
  optimizedResult: OptimizedImageResult;
}

/**
 * Optimized Image Uploader
 * 1. Optimizes and converts file to WebP client-side (~90-98% reduction)
 * 2. Uploads to Supabase Storage bucket ('portfolio' or 'avatars')
 * 3. Falls back to lightweight WebP dataURL if running in local demo mode
 */
export async function uploadOptimizedImage(
  file: File,
  bucket: "portfolio" | "avatars" = "portfolio"
): Promise<UploadResult> {
  // Step 1: Compress on client before uploading
  const optimized = await optimizeImage(file, 1200, 0.80);

  const supabase = createClient();
  if (supabase) {
    try {
      const fileExt = "webp";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, optimized.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (error) {
        console.warn("Supabase storage upload error, falling back to optimized WebP dataUrl:", error.message);
        return {
          url: optimized.dataUrl,
          optimizedResult: optimized,
        };
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        optimizedResult: optimized,
      };
    } catch (err) {
      console.warn("Storage upload exception, using optimized WebP dataUrl fallback:", err);
      return {
        url: optimized.dataUrl,
        optimizedResult: optimized,
      };
    }
  }

  // Local demo fallback: return ultra-compact WebP dataUrl
  return {
    url: optimized.dataUrl,
    optimizedResult: optimized,
  };
}
