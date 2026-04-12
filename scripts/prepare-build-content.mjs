import { promises as fs } from "node:fs";
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
  return `/${path.posix.join("images", relativePath.replaceAll("\\", "/"))}`;
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

async function main() {
  const { appRoot, appPublicDir, contentDir, sourcePublicDir, usesExternalContent } = getContentSourcePaths();
  const buildRoot = path.join(appRoot, ".content-build");
  const buildContentDir = path.join(buildRoot, "content");
  const sourceImagesDir = path.join(sourcePublicDir, "images");
  const targetImagesDir = path.join(appPublicDir, "images");

  if (!(await pathExists(contentDir))) {
    throw new Error(`Content directory not found: ${contentDir}`);
  }

  await copyDirectory(contentDir, buildContentDir);

  if (!usesExternalContent) {
    console.log(`Prepared local content snapshot in ${buildContentDir}. External image optimization skipped.`);
    return;
  }

  if (!(await pathExists(sourceImagesDir))) {
    throw new Error(`External content images directory not found: ${sourceImagesDir}`);
  }

  await fs.rm(targetImagesDir, { recursive: true, force: true });
  await fs.mkdir(targetImagesDir, { recursive: true });

  const sourceFiles = await walk(sourceImagesDir);
  const relativePaths = sourceFiles.map((filePath) => path.relative(sourceImagesDir, filePath));
  const availableTargets = new Set(
    relativePaths.map((relativePath) => relativePath.replaceAll("\\", "/").replace(/\.(jpe?g|png)$/i, ".webp")),
  );
  const replacements = new Map();

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(sourceImagesDir, sourceFile);
    const normalizedRelativePath = relativePath.replaceAll("\\", "/");
    const targetFile = path.join(targetImagesDir, relativePath);
    const extension = path.extname(sourceFile).toLowerCase();

    await fs.mkdir(path.dirname(targetFile), { recursive: true });

    if (!RASTER_IMAGE_EXTENSIONS.has(extension)) {
      await fs.copyFile(sourceFile, targetFile);
      continue;
    }

    await optimizeRasterImage(sourceFile, targetFile);

    if (extension === ".jpg" || extension === ".jpeg" || extension === ".png") {
      const webpRelativePath = normalizedRelativePath.replace(/\.(jpe?g|png)$/i, ".webp");
      const webpTarget = path.join(targetImagesDir, webpRelativePath);
      const hasSiblingWebpSource = availableTargets.has(webpRelativePath) && webpRelativePath !== normalizedRelativePath;

      if (!hasSiblingWebpSource) {
        await fs.mkdir(path.dirname(webpTarget), { recursive: true });
        await writeOptimizedWebp(sourceFile, webpTarget);
      }

      replacements.set(toPublicImagePath(normalizedRelativePath), toPublicImagePath(webpRelativePath));
    }
  }

  await rewriteBuildContentReferences(buildContentDir, replacements);

  console.log(`Prepared build content in ${buildContentDir} and optimized images in ${targetImagesDir}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});