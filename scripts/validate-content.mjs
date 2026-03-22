import { promises as fs } from "node:fs";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import matter from "gray-matter";
import yaml from "js-yaml";

const root = process.cwd();
const contentDir = path.join(root, "content");
const schemasDir = path.join(root, "schemas");

const yamlSchemaByRelativePath = {
  "content/data/main.yaml": "data-main.schema.json",
  "content/i18n/de.yaml": "i18n.schema.json",
  "content/i18n/fr.yaml": "i18n.schema.json",
};

function getYamlSchemaName(relativePath) {
  if (yamlSchemaByRelativePath[relativePath]) {
    return yamlSchemaByRelativePath[relativePath];
  }

  if (/^content\/data\/team\/[^/]+\.ya?ml$/.test(relativePath)) {
    return "data-team.schema.json";
  }

  if (/^content\/data\/services\/[^/]+\.ya?ml$/.test(relativePath)) {
    return "data-service.schema.json";
  }

  return undefined;
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

async function readJson(fileName) {
  const filePath = path.join(schemasDir, fileName);
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function toRelative(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

async function main() {
  const ajv = new Ajv2020({ allErrors: true });
  const markdownFrontmatterSchema = await readJson("markdown-frontmatter.schema.json");
  const validateFrontmatter = ajv.compile(markdownFrontmatterSchema);

  const files = await walk(contentDir);
  const yamlFiles = files.filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const errors = [];

  for (const filePath of yamlFiles) {
    const relativePath = toRelative(filePath);
    const schemaName = getYamlSchemaName(relativePath);

    if (!schemaName) {
      continue;
    }

    const [raw, schema] = await Promise.all([fs.readFile(filePath, "utf8"), readJson(schemaName)]);
    const parsed = yaml.load(raw);
    const validate = ajv.compile(schema);

    if (!validate(parsed)) {
      errors.push(`${relativePath}\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
    }
  }

  for (const filePath of markdownFiles) {
    const relativePath = toRelative(filePath);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);

    if (!validateFrontmatter(parsed.data)) {
      errors.push(`${relativePath}\n${ajv.errorsText(validateFrontmatter.errors, { separator: "\n" })}`);
    }
  }

  if (errors.length > 0) {
    console.error("Content validation failed:\n");
    for (const error of errors) {
      console.error(`- ${error}\n`);
    }
    process.exit(1);
  }

  console.log(`Content validation passed (${yamlFiles.length} YAML files, ${markdownFiles.length} Markdown files).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});