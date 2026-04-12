import { spawn } from "node:child_process";

import { getContentSourcePaths } from "./content-source.mjs";

const { repoRoot } = getContentSourcePaths();

if (!repoRoot) {
  console.error(
    [
      "No content repository found for Decap local proxy.",
      "Set CENTRENEXT_CONTENT_REPO_DIR to your content repo path or place it at ../centrebienetre-content.",
    ].join("\n"),
  );
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["decap-server"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
