import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type DownloadResult = {
  filePath: string;
  fileSize: number;
  durationMs: number;
};

const DOWNLOAD_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

const REFERER_MAP: Record<string, string> = {
  douyin: "https://www.douyin.com/",
  kuaishou: "https://www.kuaishou.com/",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function attemptDownload(
  videoUrl: string,
  outputPath: string,
  platform: string,
  log: (msg: string) => void
): Promise<DownloadResult> {
  const start = Date.now();

  const response = await fetch(videoUrl, {
    method: "GET",
    redirect: "follow",
    headers: {
      "user-agent": DOWNLOAD_USER_AGENT,
      referer: REFERER_MAP[platform] ?? "",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);

  const durationMs = Date.now() - start;
  log(`[video-extract] Downloaded ${formatFileSize(bytes.length)} in ${(durationMs / 1000).toFixed(1)}s`);

  return {
    filePath: outputPath,
    fileSize: bytes.length,
    durationMs,
  };
}

export async function downloadVideo(
  videoUrl: string,
  outputPath: string,
  platform: string,
  log: (msg: string) => void
): Promise<DownloadResult> {
  try {
    return await attemptDownload(videoUrl, outputPath, platform, log);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error ?? "");
    log(`[video-extract] First attempt failed (${msg}), retrying...`);
    return await attemptDownload(videoUrl, outputPath, platform, log);
  }
}
