import { spawn } from "node:child_process";
import path from "node:path";

import chokidar from "chokidar";

import { getContentSourcePaths } from "./content-source.mjs";

const PREPARE_SCRIPT = path.join(process.cwd(), "scripts", "prepare-build-content.mjs");
const DEFAULT_DEBOUNCE_MS = 250;

function runPrepare() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [PREPARE_SCRIPT], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`content:prepare terminated by signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`content:prepare failed with exit code ${code ?? 1}`));
        return;
      }

      resolve();
    });
  });
}

async function main() {
  const { appRoot, contentDir, sourceMediaDir, usesExternalContent } = getContentSourcePaths();
  const watchTargets = usesExternalContent ? [contentDir, sourceMediaDir] : [contentDir];
  const ignored = [
    "**/.git/**",
    "**/node_modules/**",
    path.join(appRoot, ".content-build", "**"),
  ];

  let timer;
  let isPreparing = false;
  let hasQueuedRun = false;

  const schedulePrepare = (reason) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(async () => {
      if (isPreparing) {
        hasQueuedRun = true;
        return;
      }

      isPreparing = true;
      console.log(`[content:watch] Change detected (${reason}). Refreshing content snapshot...`);

      try {
        await runPrepare();
        console.log("[content:watch] Snapshot updated.");
      } catch (error) {
        console.error(error instanceof Error ? `[content:watch] ${error.message}` : error);
      } finally {
        isPreparing = false;

        if (hasQueuedRun) {
          hasQueuedRun = false;
          schedulePrepare("queued changes");
        }
      }
    }, DEFAULT_DEBOUNCE_MS);
  };

  const watcher = chokidar.watch(watchTargets, {
    ignoreInitial: true,
    ignored,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher
    .on("all", (eventName, filePath) => {
      const relativePath = path.relative(process.cwd(), filePath) || filePath;
      schedulePrepare(`${eventName}: ${relativePath}`);
    })
    .on("ready", () => {
      console.log(`[content:watch] Watching ${watchTargets.join(", ")}`);
    })
    .on("error", (error) => {
      console.error(error instanceof Error ? `[content:watch] ${error.message}` : error);
    });

  const closeWatcher = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    await watcher.close();
  };

  process.on("SIGINT", async () => {
    await closeWatcher();
    process.exit(130);
  });

  process.on("SIGTERM", async () => {
    await closeWatcher();
    process.exit(143);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
