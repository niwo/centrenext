import { existsSync } from "node:fs";
import path from "node:path";

function resolveEnvPath(value) {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

export function getContentSourcePaths() {
  const appRoot = process.cwd();
  const appContentDir = path.join(appRoot, "content");
  const appPublicDir = path.join(appRoot, "public");
  const configuredRepoRoot = resolveEnvPath(process.env.CENTRENEXT_CONTENT_REPO_DIR);
  const defaultRepoRoot = path.resolve(appRoot, "..", "centrebienetre-content");
  const repoRoot = configuredRepoRoot ?? (existsSync(defaultRepoRoot) ? defaultRepoRoot : undefined);

  const contentDir = resolveEnvPath(process.env.CENTRENEXT_CONTENT_DIR) ?? (repoRoot ? path.join(repoRoot, "content") : appContentDir);
  const sourcePublicDir =
    resolveEnvPath(process.env.CENTRENEXT_CONTENT_PUBLIC_DIR) ?? (repoRoot ? path.join(repoRoot, "public") : appPublicDir);

  return {
    appRoot,
    appContentDir,
    appPublicDir,
    repoRoot,
    contentDir,
    sourcePublicDir,
    usesExternalContent:
      path.resolve(contentDir) !== path.resolve(appContentDir) || path.resolve(sourcePublicDir) !== path.resolve(appPublicDir),
  };
}