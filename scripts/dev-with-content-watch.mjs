import { spawn } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const prepareScript = path.join(rootDir, "scripts", "prepare-build-content.mjs");
const watcherScript = path.join(rootDir, "scripts", "watch-content.mjs");
const nextRunnerScript = path.join(rootDir, "scripts", "run-next-command.mjs");

function spawnNode(scriptPath, args = []) {
  return spawn(process.execPath, [scriptPath, ...args], {
    stdio: "inherit",
    env: process.env,
  });
}

function runInitialPrepare() {
  return new Promise((resolve, reject) => {
    const child = spawnNode(prepareScript);

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Initial content prepare terminated by signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`Initial content prepare failed with exit code ${code ?? 1}`));
        return;
      }

      resolve();
    });
  });
}

async function main() {
  await runInitialPrepare();

  const watcher = spawnNode(watcherScript);
  const next = spawnNode(nextRunnerScript, ["dev"]);
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    watcher.kill(signal);
    next.kill(signal);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  watcher.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    shutdown("SIGTERM");
    process.exit(code ?? (signal ? 1 : 0));
  });

  next.on("exit", (code, signal) => {
    if (shuttingDown) {
      process.exit(code ?? (signal ? 1 : 0));
      return;
    }

    shutdown("SIGTERM");
    process.exit(code ?? (signal ? 1 : 0));
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
