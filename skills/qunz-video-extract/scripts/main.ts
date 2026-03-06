import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { mkdir } from "node:fs/promises";

import { extractVideoInfo, extractUrlFromInput, type VideoInfo } from "./extractor.js";
import { downloadVideo, formatFileSize } from "./downloader.js";

type CliArgs = {
  input: string | null;
  output: string | null;
  json: boolean;
  info: boolean;
  help: boolean;
};

function printUsage(exitCode: number): never {
  const cmd = "npx -y bun skills/qunz-video-extract/scripts/main.ts";
  console.log(`Video Extractor (Douyin / Kuaishou)

Usage:
  ${cmd} <url-or-text>
  ${cmd} <url> -o ./output/

Options:
  <url-or-text>     Short URL or text containing a short URL
  --output <path>, -o  Output directory or file path
  --json               Output as JSON
  --info               Show video info only, do not download
  --help, -h           Show help

Supported URLs:
  https://v.douyin.com/xxxxxxx/
  https://v.kuaishou.com/xxxxxxx

Examples:
  ${cmd} "https://v.douyin.com/abc123/"
  ${cmd} "https://v.kuaishou.com/xyz789"
  ${cmd} "看这个视频 https://v.douyin.com/abc123/ 很有趣"
  ${cmd} "https://v.douyin.com/abc123/" --info --json
  ${cmd} "https://v.douyin.com/abc123/" -o ~/Videos/
`);
  process.exit(exitCode);
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    input: null,
    output: null,
    json: false,
    info: false,
    help: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;

    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }

    if (a === "--json") {
      out.json = true;
      continue;
    }

    if (a === "--info") {
      out.info = true;
      continue;
    }

    if (a === "--output" || a === "-o") {
      const v = argv[++i];
      if (!v) throw new Error(`Missing value for ${a}`);
      out.output = v;
      continue;
    }

    if (a.startsWith("-")) {
      throw new Error(`Unknown option: ${a}`);
    }

    positional.push(a);
  }

  if (positional.length > 0) {
    out.input = positional.join(" ");
  }

  return out;
}

function sanitizeSlug(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 80);
}

function generateSlug(info: VideoInfo): string {
  if (info.title) {
    const ascii = info.title.replace(/[^\x20-\x7E]/g, "").trim();
    const slug = sanitizeSlug(ascii.slice(0, 60)).toLowerCase();
    if (slug.length >= 5) return slug;
  }
  return info.videoId;
}

function resolveOutputPath(
  info: VideoInfo,
  argsOutput: string | null
): { outputDir: string; videoPath: string } {
  const slug = generateSlug(info);

  if (argsOutput) {
    const resolved = path.resolve(argsOutput);
    const looksDir = argsOutput.endsWith("/") || argsOutput.endsWith("\\");

    try {
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        return {
          outputDir: resolved,
          videoPath: path.join(resolved, `video-${slug}.mp4`),
        };
      }
    } catch {}

    if (looksDir) {
      return {
        outputDir: resolved,
        videoPath: path.join(resolved, `video-${slug}.mp4`),
      };
    }

    return {
      outputDir: path.dirname(resolved),
      videoPath: resolved,
    };
  }

  let outputDir = path.resolve(process.cwd(), "video-extract", slug);

  if (fs.existsSync(outputDir)) {
    const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
    outputDir = path.resolve(process.cwd(), "video-extract", `${slug}-${ts}`);
  }

  return {
    outputDir,
    videoPath: path.join(outputDir, `video-${slug}.mp4`),
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) printUsage(0);
  if (!args.input) printUsage(1);

  const log = (message: string) => console.error(message);

  const shortUrl = extractUrlFromInput(args.input!);
  if (!shortUrl) {
    throw new Error(
      "No supported short URL found in input. Supported: v.douyin.com, v.kuaishou.com"
    );
  }

  log(`[video-extract] Extracted URL: ${shortUrl}`);

  const info = await extractVideoInfo(shortUrl, log);

  if (args.info) {
    const output = {
      platform: info.platform,
      videoId: info.videoId,
      title: info.title || null,
      author: info.author || null,
      videoUrl: info.videoUrl,
      coverUrl: info.coverUrl,
      originalUrl: info.originalUrl,
      resolvedUrl: info.resolvedUrl,
    };

    if (args.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(`Platform: ${output.platform}`);
      console.log(`Video ID: ${output.videoId}`);
      if (output.title) console.log(`Title: ${output.title}`);
      if (output.author) console.log(`Author: ${output.author}`);
      console.log(`Video URL: ${output.videoUrl}`);
      if (output.coverUrl) console.log(`Cover URL: ${output.coverUrl}`);
    }
    return;
  }

  const { outputDir, videoPath } = resolveOutputPath(info, args.output);
  await mkdir(outputDir, { recursive: true });

  log(`[video-extract] Downloading video to ${videoPath}...`);
  const result = await downloadVideo(info.videoUrl, videoPath, info.platform, log);

  log(`[video-extract] Done! File: ${result.filePath} (${formatFileSize(result.fileSize)})`);

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          platform: info.platform,
          videoId: info.videoId,
          title: info.title || null,
          author: info.author || null,
          videoUrl: info.videoUrl,
          coverUrl: info.coverUrl,
          filePath: result.filePath,
          fileSize: result.fileSize,
          durationMs: result.durationMs,
        },
        null,
        2
      )
    );
  } else {
    console.log(result.filePath);
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error ?? ""));
  process.exit(1);
});
