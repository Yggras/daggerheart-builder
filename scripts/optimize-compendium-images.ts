import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type ImageFamily = {
  sourceDir: string;
  outputDir: string;
  maxLongEdge: number;
  quality: number;
  aliases?: Record<string, string>;
};

const families: Record<string, ImageFamily> = {
  ancestries: {
    sourceDir: "art-source/compendium/ancestries",
    outputDir: "assets/compendium/ancestries",
    maxLongEdge: 1200,
    quality: 78,
    aliases: {
      fairie: "faerie",
    },
  },
  adversaries: {
    sourceDir: "art-source/compendium/adversaries",
    outputDir: "assets/compendium/adversaries",
    maxLongEdge: 1200,
    quality: 76,
  },
};

const requestedFamily = process.argv[2] ?? "ancestries";
const selectedFamily = families[requestedFamily];

if (!selectedFamily) {
  throw new Error(`Unknown image family "${requestedFamily}". Expected one of: ${Object.keys(families).join(", ")}`);
}

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function toSlug(filename: string, aliases: Record<string, string> = {}) {
  const baseSlug = path
    .parse(filename)
    .name.trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return aliases[baseSlug] ?? baseSlug;
}

async function optimizeImages(family: ImageFamily) {
  await mkdir(family.outputDir, { recursive: true });

  const files = await readdir(family.sourceDir);
  const imageFiles = files.filter((file) => imageExtensions.has(path.extname(file).toLowerCase())).sort();

  if (imageFiles.length === 0) {
    throw new Error(`No images found in ${family.sourceDir}`);
  }

  let inputBytes = 0;
  let outputBytes = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(family.sourceDir, file);
    const outputPath = path.join(family.outputDir, `${toSlug(file, family.aliases)}.webp`);
    const inputStats = await stat(inputPath);
    inputBytes += inputStats.size;

    await sharp(inputPath)
      .rotate()
      .resize({
        width: family.maxLongEdge,
        height: family.maxLongEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: family.quality, effort: 6 })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    outputBytes += outputStats.size;
    console.log(`${file} -> ${path.basename(outputPath)} (${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)})`);
  }

  console.log(`Optimized ${imageFiles.length} ${requestedFamily} images.`);
  console.log(`Total: ${formatBytes(inputBytes)} -> ${formatBytes(outputBytes)}`);
}

function formatBytes(bytes: number) {
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} MiB`;
}

optimizeImages(selectedFamily).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
