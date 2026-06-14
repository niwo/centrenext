import { existsSync } from "node:fs";
import path from "node:path";

function resolveEnvPath(value) {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function resolveDefaultRepoRoot(appRoot) {
  const candidates = [
    path.resolve(appRoot, "..", "centrebienetre-content"),
    path.resolve(appRoot, "..", "content"),
  ];

  return candidates.find((candidatePath) => existsSync(candidatePath));
}

export function getContentSourcePaths() {
  const appRoot = process.cwd();
  const appContentDir = path.join(appRoot, "content");
  const appPublicDir = path.join(appRoot, "public");
  const appMediaDir = path.join(appPublicDir, "media");
  const configuredRepoRoot = resolveEnvPath(process.env.CENTRENEXT_CONTENT_REPO_DIR);
  const repoRoot = configuredRepoRoot ?? resolveDefaultRepoRoot(appRoot);
  const configuredMediaDir = resolveEnvPath(process.env.CENTRENEXT_CONTENT_MEDIA_DIR);
  const configuredLegacyPublicDir = resolveEnvPath(process.env.CENTRENEXT_CONTENT_PUBLIC_DIR);

  const contentDir = resolveEnvPath(process.env.CENTRENEXT_CONTENT_DIR) ?? (repoRoot ? path.join(repoRoot, "content") : appContentDir);
  const sourceMediaDir =
    configuredMediaDir ??
    (configuredLegacyPublicDir ? path.join(configuredLegacyPublicDir, "media") : undefined) ??
    (repoRoot ? path.join(repoRoot, "media") : appMediaDir);

  return {
    appRoot,
    appContentDir,
    appPublicDir,
    appMediaDir,
    repoRoot,
    contentDir,
    sourceMediaDir,
    usesExternalContent:
      path.resolve(contentDir) !== path.resolve(appContentDir) || path.resolve(sourceMediaDir) !== path.resolve(appMediaDir),
  };
}