import { chromium, type Browser, type Page, type Response } from "playwright";

export type Platform = "douyin" | "kuaishou";

export type VideoInfo = {
  platform: Platform;
  videoId: string;
  title: string;
  author: string;
  videoUrl: string;
  coverUrl: string | null;
  originalUrl: string;
  resolvedUrl: string;
};

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

const DOUYIN_URL_RE = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/;
const KUAISHOU_URL_RE = /https?:\/\/v\.kuaishou\.com\/[a-zA-Z0-9]+\/?/;

const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function detectPlatform(url: string): Platform | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "v.douyin.com" || parsed.hostname === "www.douyin.com") return "douyin";
    if (parsed.hostname === "v.kuaishou.com" || parsed.hostname === "www.kuaishou.com") return "kuaishou";
  } catch {}
  return null;
}

export function extractUrlFromInput(input: string): string | null {
  const trimmed = input.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === "v.douyin.com" || parsed.hostname === "v.kuaishou.com") {
      return trimmed;
    }
  } catch {}

  const douyinMatch = trimmed.match(DOUYIN_URL_RE);
  if (douyinMatch) return douyinMatch[0];

  const kuaishouMatch = trimmed.match(KUAISHOU_URL_RE);
  if (kuaishouMatch) return kuaishouMatch[0];

  return null;
}

function extractVideoIdFromUrl(url: string, platform: Platform): string {
  try {
    const parsed = new URL(url);
    if (platform === "douyin") {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      if (match?.[1]) return match[1];
    }
    if (platform === "kuaishou") {
      const match = parsed.pathname.match(/\/short-video\/([a-zA-Z0-9]+)/);
      if (match?.[1]) return match[1];
    }
  } catch {}
  return String(Date.now());
}

function isVideoResponse(response: Response): boolean {
  const ct = response.headers()["content-type"] ?? "";
  const normalizedCt = ct.split(";")[0]?.trim().toLowerCase() ?? "";

  if (VIDEO_CONTENT_TYPES.some((t) => normalizedCt.startsWith(t))) return true;

  const url = response.url();
  if (/\.(mp4|m4v|webm)(\?|$)/i.test(url)) return true;

  return false;
}

function isLikelyVideoUrl(url: string): boolean {
  if (/\.(mp4|m4v|webm)(\?|$)/i.test(url)) return true;
  if (/video/.test(url) && /cdn|media|stream|play/.test(url)) return true;
  return false;
}

async function extractMetadata(
  page: Page,
  platform: Platform
): Promise<{ title: string; author: string; coverUrl: string | null }> {
  let title = "";
  let author = "";
  let coverUrl: string | null = null;

  try {
    title = await page.title();
    title = title.replace(/\s*[-|–—].*$/, "").trim();
  } catch {}

  if (platform === "douyin") {
    try {
      author = await page.$eval(
        '[data-e2e="video-author-info"] .semi-modal-content, .author-name, [class*="author"]',
        (el) => (el as HTMLElement).textContent?.trim() ?? ""
      );
    } catch {}

    if (!author) {
      try {
        const pageContent = await page.content();
        const authorMatch = pageContent.match(/"nickname"\s*:\s*"([^"]+)"/);
        if (authorMatch?.[1]) author = authorMatch[1];
      } catch {}
    }

    try {
      const pageContent = await page.content();
      const coverMatch = pageContent.match(/"cover"\s*:\s*\{[^}]*"url_list"\s*:\s*\["([^"]+)"/);
      if (coverMatch?.[1]) coverUrl = coverMatch[1];
    } catch {}
  }

  if (platform === "kuaishou") {
    try {
      author = await page.$eval(
        '.video-author, [class*="author"], .user-name',
        (el) => (el as HTMLElement).textContent?.trim() ?? ""
      );
    } catch {}

    if (!author) {
      try {
        const pageContent = await page.content();
        const authorMatch = pageContent.match(/"userName"\s*:\s*"([^"]+)"/);
        if (authorMatch?.[1]) author = authorMatch[1];
      } catch {}
    }
  }

  return { title, author, coverUrl };
}

export async function extractVideoInfo(
  shortUrl: string,
  log: (msg: string) => void
): Promise<VideoInfo> {
  const platform = detectPlatform(shortUrl);
  if (!platform) {
    throw new Error(`Unsupported URL: ${shortUrl}. Only v.douyin.com and v.kuaishou.com are supported.`);
  }

  log(`[video-extract] Platform: ${platform}`);
  log("[video-extract] Launching browser...");

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: MOBILE_USER_AGENT,
      viewport: MOBILE_VIEWPORT,
    });
    const page = await context.newPage();

    const capturedVideoUrls: string[] = [];

    page.on("response", (response) => {
      if (response.status() >= 200 && response.status() < 400) {
        if (isVideoResponse(response)) {
          capturedVideoUrls.push(response.url());
        }
      }
    });

    page.on("request", (request) => {
      const url = request.url();
      if (isLikelyVideoUrl(url) && request.resourceType() === "media") {
        if (!capturedVideoUrls.includes(url)) {
          capturedVideoUrls.push(url);
        }
      }
    });

    log(`[video-extract] Navigating to ${shortUrl}...`);
    await page.goto(shortUrl, { waitUntil: "networkidle", timeout: 30_000 });

    const resolvedUrl = page.url();
    log(`[video-extract] Resolved URL: ${resolvedUrl}`);

    const videoId = extractVideoIdFromUrl(resolvedUrl, platform);
    log(`[video-extract] Video ID: ${videoId}`);

    await page.waitForTimeout(2000);

    let videoUrl = capturedVideoUrls.length > 0 ? capturedVideoUrls[capturedVideoUrls.length - 1]! : "";

    if (!videoUrl) {
      log("[video-extract] No video in network traffic, trying DOM extraction...");
      try {
        videoUrl = await page.$eval("video", (el) => {
          const video = el as HTMLVideoElement;
          return video.src || video.querySelector("source")?.src || "";
        });
      } catch {}
    }

    if (!videoUrl) {
      log("[video-extract] Trying page source JSON extraction...");
      try {
        const content = await page.content();

        const patterns = [
          /"playUrl"\s*:\s*"([^"]+)"/,
          /"play_addr"\s*:\s*\{[^}]*"url_list"\s*:\s*\["([^"]+)"/,
          /"videoUrl"\s*:\s*"([^"]+)"/,
          /"srcNoMark"\s*:\s*"([^"]+)"/,
          /"url"\s*:\s*"(https?:[^"]*\.mp4[^"]*)"/,
        ];

        for (const pattern of patterns) {
          const match = content.match(pattern);
          const candidate = match?.[1] ?? match?.[2];
          if (candidate) {
            videoUrl = candidate.replace(/\\u002F/g, "/").replace(/\\\//g, "/");
            log(`[video-extract] Found video URL via JSON pattern`);
            break;
          }
        }
      } catch {}
    }

    if (!videoUrl) {
      throw new Error("Could not extract video URL from page. The page might require login or the video is unavailable.");
    }

    if (videoUrl.startsWith("blob:")) {
      throw new Error("Video uses blob URL which cannot be downloaded directly. Try a different video.");
    }

    const { title, author, coverUrl } = await extractMetadata(page, platform);

    log(`[video-extract] Title: ${title || "(unknown)"}`);
    log(`[video-extract] Author: ${author || "(unknown)"}`);

    await browser.close();
    browser = null;

    return {
      platform,
      videoId,
      title,
      author,
      videoUrl,
      coverUrl,
      originalUrl: shortUrl,
      resolvedUrl,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
