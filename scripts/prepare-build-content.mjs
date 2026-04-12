import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

import sharp from "sharp";

import { getContentSourcePaths } from "./content-source.mjs";

const RASTER_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const TEXT_CONTENT_EXTENSIONS = new Set([".yaml", ".yml", ".md"]);
const MAX_IMAGE_DIMENSION = 2200;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
}

async function optimizeRasterImage(sourcePath, targetPath) {
  const extension = path.extname(sourcePath).toLowerCase();
  const image = sharp(sourcePath).rotate().resize({
    width: MAX_IMAGE_DIMENSION,
    height: MAX_IMAGE_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (extension === ".jpg" || extension === ".jpeg") {
    await image.jpeg({ quality: 82, mozjpeg: true }).toFile(targetPath);
    return;
  }

  if (extension === ".png") {
    await image.png({ compressionLevel: 9, palette: true }).toFile(targetPath);
    return;
  }

  if (extension === ".webp") {
    await image.webp({ quality: 82 }).toFile(targetPath);
    return;
  }

  if (extension === ".avif") {
    await image.avif({ quality: 60 }).toFile(targetPath);
  }
}

async function writeOptimizedWebp(sourcePath, targetPath) {
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(targetPath);
}

function toPublicImagePath(relativePath) {
  return `/${path.posix.join("media", relativePath.replaceAll("\\", "/"))}`;
}

async function rewriteBuildContentReferences(buildContentDir, replacements) {
  if (replacements.size === 0) {
    return;
  }

  const files = await walk(buildContentDir);

  await Promise.all(
    files.map(async (filePath) => {
      if (!TEXT_CONTENT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
        return;
      }

      const original = await fs.readFile(filePath, "utf8");
      let updated = original;

      for (const [fromPath, toPath] of replacements.entries()) {
        updated = updated.split(fromPath).join(toPath);
      }

      if (updated !== original) {
        await fs.writeFile(filePath, updated, "utf8");
      }
    }),
  );
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} terminated by signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code ?? 1}`));
        return;
      }

      resolve();
    });
  });
}

async function bootstrapExternalContentRepo(appRoot) {
  if (process.env.CENTRENEXT_CONTENT_DIR || process.env.CENTRENEXT_CONTENT_REPO_DIR) {
    return false;
  }

  const repoSlug = process.env.CENTRENEXT_CONTENT_REPO_SLUG ?? "niwo/centrebienetre-content";
  const repoBranch = process.env.CENTRENEXT_CONTENT_REPO_BRANCH ?? "main";
  const accessToken = process.env.CONTENT_REPO_TOKEN ?? process.env.CENTRENEXT_CONTENT_REPO_TOKEN;

  if (!accessToken) {
    return false;
  }

  const checkoutDir = path.join(appRoot, ".content-source");
  const cloneUrl = `https://x-access-token:${encodeURIComponent(accessToken)}@github.com/${repoSlug}.git`;

  await fs.rm(checkoutDir, { recursive: true, force: true });
  console.log(`Content directory missing. Cloning ${repoSlug}#${repoBranch} to ${checkoutDir} ...`);
  await runCommand("git", ["clone", "--depth", "1", "--branch", repoBranch, cloneUrl, checkoutDir], appRoot);
  process.env.CENTRENEXT_CONTENT_REPO_DIR = checkoutDir;
  return true;
}

async function main() {
  let { appRoot, appPublicDir, contentDir, sourceMediaDir, usesExternalContent } = getContentSourcePaths();
  const buildRoot = path.join(appRoot, ".content-build");
  const buildContentDir = path.join(buildRoot, "content");
  const legacyTargetImagesDir = path.join(appPublicDir, "images");
  const legacyTargetUploadsDir = path.join(appPublicDir, "uploads");
  const targetMediaDir = path.join(appPublicDir, "media");

  if (!(await pathExists(contentDir))) {
    const bootstrapped = await bootstrapExternalContentRepo(appRoot);

    if (bootstrapped) {
      ({ appRoot, appPublicDir, contentDir, sourceMediaDir, usesExternalContent } = getContentSourcePaths());
    }
  }

  if (!(await pathExists(contentDir))) {
    throw new Error(
      [
        `Content directory not found: ${contentDir}`,
        "Set CENTRENEXT_CONTENT_REPO_DIR (or CENTRENEXT_CONTENT_DIR) to your content repository path.",
        "Alternatively set CONTENT_REPO_TOKEN (and optional CENTRENEXT_CONTENT_REPO_SLUG/CENTRENEXT_CONTENT_REPO_BRANCH) for automatic checkout during build.",
        "Default autodiscovery expects a sibling folder: ../centrebienetre-content",
      ].join("\n"),
    );
  }

  await copyDirectory(contentDir, buildContentDir);

  if (!usesExternalContent) {
    console.log(`Prepared local content snapshot in ${buildContentDir}. External image optimization skipped.`);
    return;
  }

  if (!(await pathExists(sourceMediaDir))) {
    throw new Error(`External content media directory not found: ${sourceMediaDir}`);
  }

  await fs.rm(legacyTargetImagesDir, { recursive: true, force: true });
  await fs.rm(legacyTargetUploadsDir, { recursive: true, force: true });
  await fs.rm(targetMediaDir, { recursive: true, force: true });
  await fs.mkdir(targetMediaDir, { recursive: true });

  const sourceFiles = await walk(sourceMediaDir);
  const relativePaths = sourceFiles.map((filePath) => path.relative(sourceMediaDir, filePath));
  const availableSourceFiles = new Set(relativePaths.map((relativePath) => relativePath.replaceAll("\\", "/")));
  const replacements = new Map();

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(sourceMediaDir, sourceFile);
    const normalizedRelativePath = relativePath.replaceAll("\\", "/");
    const targetFile = path.join(targetMediaDir, relativePath);
    const extension = path.extname(sourceFile).toLowerCase();

    await fs.mkdir(path.dirname(targetFile), { recursive: true });

    if (!RASTER_IMAGE_EXTENSIONS.has(extension)) {
      await fs.copyFile(sourceFile, targetFile);
      continue;
    }

    await optimizeRasterImage(sourceFile, targetFile);

    if (extension === ".jpg" || extension === ".jpeg" || extension === ".png") {
      const webpRelativePath = normalizedRelativePath.replace(/\.(jpe?g|png)$/i, ".webp");
      const webpTarget = path.join(targetMediaDir, webpRelativePath);
      const hasSiblingWebpSource = availableSourceFiles.has(webpRelativePath) && webpRelativePath !== normalizedRelativePath;

      if (!hasSiblingWebpSource) {
        await fs.mkdir(path.dirname(webpTarget), { recursive: true });
        await writeOptimizedWebp(sourceFile, webpTarget);
      }

      replacements.set(toPublicImagePath(normalizedRelativePath), toPublicImagePath(webpRelativePath));
    }
  }

  await rewriteBuildContentReferences(buildContentDir, replacements);

  console.log(`Prepared build content in ${buildContentDir} and optimized media in ${targetMediaDir}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});