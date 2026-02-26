import path from "node:path";
import { readFile } from "node:fs/promises";
import type { CliArgs } from "../types";

const DEFAULT_MODEL = "gemini-3-pro-image-preview";
const SEEDREAM_5_LITE_MODEL = "doubao-seedream-5-0-lite";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 300_000;

const MODEL_ALIASES: Record<string, string> = {
  "seedream-5-lite": SEEDREAM_5_LITE_MODEL,
  "doubao-seedream-5-lite": SEEDREAM_5_LITE_MODEL,
};

export function getDefaultModel(): string {
  return process.env.APIMART_IMAGE_MODEL || DEFAULT_MODEL;
}

function getApiKey(): string | null {
  return process.env.APIMART_API_KEY || null;
}

function getBaseUrl(): string {
  const base = process.env.APIMART_BASE_URL || "https://api.apimart.ai";
  return base.replace(/\/+$/g, "");
}

function getTaskLanguage(): string {
  return process.env.APIMART_TASK_LANGUAGE || "en";
}

function resolveModelName(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return model;
  return MODEL_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function getResolution(args: CliArgs, model: string): "1K" | "2K" | "4K" {
  let resolution: "1K" | "2K" | "4K";
  if (args.imageSize === "1K" || args.imageSize === "2K" || args.imageSize === "4K") {
    resolution = args.imageSize;
  } else {
    resolution = args.quality === "2k" ? "2K" : "1K";
  }

  if (model.toLowerCase() === SEEDREAM_5_LITE_MODEL && resolution !== "2K") {
    console.warn(
      "Model doubao-seedream-5-0-lite supports 2K/3K. This CLI supports 1K/2K/4K, so resolution is forced to 2K."
    );
    return "2K";
  }

  return resolution;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function normalizeSize(size: string | null, aspectRatio: string | null): string | null {
  if (aspectRatio) return aspectRatio;
  if (!size) return null;

  const trimmed = size.trim();
  const ratioMatch = trimmed.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (ratioMatch) return trimmed;

  const whMatch = trimmed.match(/^(\d+)x(\d+)$/i);
  if (!whMatch) return trimmed;

  const width = parseInt(whMatch[1]!, 10);
  const height = parseInt(whMatch[2]!, 10);
  if (width <= 0 || height <= 0) return trimmed;

  const d = gcd(width, height);
  return `${Math.round(width / d)}:${Math.round(height / d)}`;
}

async function readImageAsDataUrl(p: string): Promise<string> {
  const buf = await readFile(p);
  const ext = path.extname(p).toLowerCase();
  let mimeType = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".gif") mimeType = "image/gif";
  else if (ext === ".webp") mimeType = "image/webp";
  return `data:${mimeType};base64,${buf.toString("base64")}`;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function stringifyCompact(v: unknown, max = 600): string {
  try {
    const s = JSON.stringify(v);
    if (!s) return String(v);
    return s.length <= max ? s : `${s.slice(0, max)}...`;
  } catch {
    return String(v);
  }
}

function extractTopLevelError(payload: unknown): string {
  const top = asRecord(payload);
  if (!top) return stringifyCompact(payload);

  if (typeof top.message === "string" && top.message) {
    return top.message;
  }

  const err = asRecord(top.error);
  if (err) {
    if (typeof err.message === "string" && err.message) return err.message;
    if (typeof err.type === "string" && err.type) return err.type;
    if (typeof err.code === "number") return String(err.code);
  }

  return stringifyCompact(payload);
}

function extractTaskId(payload: unknown): string {
  const top = asRecord(payload);
  if (!top) throw new Error(`Unexpected APIMart response: ${stringifyCompact(payload)}`);

  if (typeof top.task_id === "string" && top.task_id.length > 0) {
    return top.task_id;
  }

  const data = top.data;
  if (Array.isArray(data)) {
    const first = asRecord(data[0]);
    if (first && typeof first.task_id === "string" && first.task_id.length > 0) {
      return first.task_id;
    }
  }

  const dataObj = asRecord(data);
  if (dataObj && typeof dataObj.task_id === "string" && dataObj.task_id.length > 0) {
    return dataObj.task_id;
  }

  throw new Error(`APIMart response missing task_id: ${stringifyCompact(payload)}`);
}

async function createTask(
  apiKey: string,
  body: Record<string, unknown>
): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Keep raw text in error message.
  }

  if (!res.ok) {
    throw new Error(`APIMart create task error (${res.status}): ${text}`);
  }

  const top = asRecord(json);
  if (top && typeof top.code === "number" && top.code !== 200) {
    throw new Error(`APIMart create task returned code ${top.code}: ${extractTopLevelError(json)}`);
  }

  return extractTaskId(json ?? text);
}

type TaskState = {
  status: string | null;
  task: Record<string, unknown>;
};

function normalizeTaskPayload(payload: unknown): TaskState {
  const top = asRecord(payload);
  if (!top) return { status: null, task: {} };

  const rawData = top.data ?? top;
  const task = Array.isArray(rawData)
    ? asRecord(rawData[0]) || {}
    : asRecord(rawData) || {};

  const statusRaw = task.status;
  const status = typeof statusRaw === "string" ? statusRaw.toLowerCase() : null;
  return { status, task };
}

async function getTaskStatus(apiKey: string, taskId: string): Promise<TaskState> {
  const language = encodeURIComponent(getTaskLanguage());
  const url = `${getBaseUrl()}/v1/tasks/${encodeURIComponent(taskId)}?language=${language}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Keep raw text in error message.
  }

  if (!res.ok) {
    throw new Error(`APIMart task status error (${res.status}): ${text}`);
  }

  const top = asRecord(json);
  if (top && typeof top.code === "number" && top.code !== 200) {
    throw new Error(`APIMart task status returned code ${top.code}: ${extractTopLevelError(json)}`);
  }

  return normalizeTaskPayload(json ?? text);
}

function findFirstImageUrl(value: unknown, seen = new WeakSet<object>()): string | null {
  if (typeof value === "string") {
    if (value.startsWith("https://") || value.startsWith("http://") || value.startsWith("data:image/")) {
      return value;
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstImageUrl(item, seen);
      if (found) return found;
    }
    return null;
  }

  const obj = asRecord(value);
  if (!obj) return null;
  if (seen.has(obj)) return null;
  seen.add(obj);

  const directKeys = [
    "url",
    "image_url",
    "imageUrl",
    "output_url",
    "outputUrl",
    "file_url",
    "fileUrl",
    "cdn_url",
    "cdnUrl",
  ];
  for (const key of directKeys) {
    const v = obj[key];
    if (typeof v === "string" && (v.startsWith("https://") || v.startsWith("http://") || v.startsWith("data:image/"))) {
      return v;
    }
  }

  const nestedKeys = ["images", "image", "result", "output", "outputs", "data"];
  for (const key of nestedKeys) {
    const found = findFirstImageUrl(obj[key], seen);
    if (found) return found;
  }

  for (const v of Object.values(obj)) {
    const found = findFirstImageUrl(v, seen);
    if (found) return found;
  }

  return null;
}

function extractErrorMessage(task: Record<string, unknown>): string {
  const err = asRecord(task.error);
  if (!err) return "unknown error";
  if (typeof err.message === "string" && err.message) return err.message;
  if (typeof err.type === "string" && err.type) return err.type;
  if (typeof err.code === "number") return String(err.code);
  return stringifyCompact(err);
}

async function pollUntilComplete(apiKey: string, taskId: string): Promise<string> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_MS) {
    const { status, task } = await getTaskStatus(apiKey, taskId);

    if (status === "completed") {
      const imageUrl = findFirstImageUrl(task.result ?? task);
      if (imageUrl) return imageUrl;
      throw new Error(`APIMart task completed but no image URL found: ${stringifyCompact(task)}`);
    }

    if (status === "failed" || status === "cancelled" || status === "canceled") {
      throw new Error(`APIMart task ${status}: ${extractErrorMessage(task)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`APIMart task timed out after ${MAX_POLL_MS / 1000}s`);
}

async function downloadImage(imageUrl: string): Promise<Uint8Array> {
  if (imageUrl.startsWith("data:image/")) {
    const commaIdx = imageUrl.indexOf(",");
    if (commaIdx === -1) throw new Error("Invalid data URI image from APIMart");
    const b64 = imageUrl.slice(commaIdx + 1);
    return Uint8Array.from(Buffer.from(b64, "base64"));
  }

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download image from APIMart: ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("APIMART_API_KEY is required");

  const resolvedModel = resolveModelName(model);
  const size = normalizeSize(args.size, args.aspectRatio);
  const resolution = getResolution(args, resolvedModel);
  if (args.n !== 1) {
    console.warn("APIMart currently only supports n=1. Overriding requested value.");
  }

  const requestBody: Record<string, unknown> = {
    model: resolvedModel,
    prompt,
    n: 1,
    resolution,
  };
  if (size) requestBody.size = size;

  if (args.referenceImages.length > 0) {
    const imageUrls: string[] = [];
    for (const refPath of args.referenceImages) {
      imageUrls.push(await readImageAsDataUrl(refPath));
    }
    requestBody.image_urls = imageUrls;
  }

  console.log(`Submitting image generation task to APIMart (${resolvedModel})...`);
  const taskId = await createTask(apiKey, requestBody);
  console.log(`Task submitted: ${taskId}. Polling status...`);

  const imageUrl = await pollUntilComplete(apiKey, taskId);
  console.log("Generation completed.");
  return downloadImage(imageUrl);
}
