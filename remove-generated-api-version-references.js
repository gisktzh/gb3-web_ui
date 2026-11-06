const fs = require('node:fs/promises');
const path = require('node:path');

const allowedDirectory = path.resolve(__dirname, '../src/app');
const inputPath = process.argv[2];

async function main() {
  if (!inputPath) {
    throw new Error('Missing file path argument.');
  }

  const filePath = path.resolve(allowedDirectory, inputPath);
  const relativePath = path.relative(allowedDirectory, filePath);

  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    throw new Error('File path is outside the allowed directory.');
  }

  // Resolve symlinks before accessing the file.
  const realAllowedDirectory = await fs.realpath(allowedDirectory);
  const realFilePath = await fs.realpath(filePath);
  const realRelativePath = path.relative(realAllowedDirectory, realFilePath);

  if (realRelativePath === '..' || realRelativePath.startsWith(`..${path.sep}`) || path.isAbsolute(realRelativePath)) {
    throw new Error('File path resolves outside the allowed directory.');
  }

  console.log(`Removing API version references from '${realFilePath}'.`);

  let data = await fs.readFile(realFilePath, 'utf-8');

  data = data.replace(/export type V\d+/g, 'export type ');
  data = data.replace(/export interface V\d+/g, 'export interface ');

  await fs.writeFile(realFilePath, data, 'utf-8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
