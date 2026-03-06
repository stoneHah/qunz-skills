import os from "node:os";
import path from "node:path";
import process from "node:process";

const APP_DATA_DIR = "baoyu-skills";
const VIDEO_EXTRACT_DATA_DIR = "video-extract";

export function resolveUserDataRoot(): string {
  if (process.platform === "win32") {
    return process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support");
  }
  return process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share");
}

export function resolveVideoExtractDataDir(): string {
  const override = process.env.VIDEO_EXTRACT_DATA_DIR?.trim();
  if (override) return path.resolve(override);
  return path.join(resolveUserDataRoot(), APP_DATA_DIR, VIDEO_EXTRACT_DATA_DIR);
}
