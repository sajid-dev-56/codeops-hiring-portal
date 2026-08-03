"use client";

import { useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  videoType: "DRIVE" | "YOUTUBE" | "EXTERNAL_LINK";
  title?: string;
  allowDownload?: boolean;
}

function getDriveEmbedUrl(url: string): string {
  // Handle various Google Drive URL formats
  // Format: https://drive.google.com/file/d/FILE_ID/view
  // Convert to: https://drive.google.com/file/d/FILE_ID/preview
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
  }
  // Handle direct embed links
  if (url.includes("/preview")) return url;
  return url;
}

function getDriveDownloadUrl(url: string): string | null {
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
  }
  return null;
}

function getYouTubeEmbedUrl(url: string): string {
  // Handle various YouTube URL formats
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  if (videoIdMatch) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  return url;
}

export default function VideoPlayer({
  videoUrl,
  videoType,
  title,
  allowDownload = true,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-surface-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-surface-500 dark:text-surface-400">No video available</p>
        </div>
      </div>
    );
  }

  let embedUrl = videoUrl;
  let downloadUrl: string | null = null;

  if (videoType === "DRIVE") {
    embedUrl = getDriveEmbedUrl(videoUrl);
    downloadUrl = getDriveDownloadUrl(videoUrl);
  } else if (videoType === "YOUTUBE") {
    embedUrl = getYouTubeEmbedUrl(videoUrl);
  }

  if (videoType === "EXTERNAL_LINK") {
    return (
      <div className="aspect-video bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-surface-600 dark:text-surface-300 mb-4">External Video Link</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all hover:-translate-y-0.5"
          >
            Open Video
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-900 shadow-xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-surface-400 text-sm">Loading video...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900 z-10">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-danger-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-surface-400">Failed to load video</p>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 text-sm hover:underline mt-2 inline-block">
                Open in new tab →
              </a>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title || "Video Player"}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      </div>

      {/* Download Button */}
      {allowDownload && downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-sm font-medium transition-all border border-surface-200 dark:border-surface-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Video
        </a>
      )}
    </div>
  );
}
