import { spawn } from "node:child_process";
import path from "node:path";

const command = process.argv[2];

if (!command) {
  console.error("Missing Next.js command. Use: node scripts/run-next-command.mjs <dev|build|start>");
  process.exit(1);
}

const buildContentDir = path.join(process.cwd(), ".content-build", "content");

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", command],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CENTRENEXT_CONTENT_DIR: buildContentDir,
    },
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});