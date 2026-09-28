import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const outputDirectory = resolve('dist');
const statsPath = resolve(outputDirectory, 'stats.json');

if (!existsSync(statsPath)) {
  throw new Error('dist/stats.json is missing. Build with --stats-json before running this check.');
}

const {outputs} = JSON.parse(readFileSync(statsPath, 'utf8'));
const entryPoints = Object.entries(outputs)
  .filter(([, output]) => output.entryPoint === 'src/main.ts')
  .map(([fileName]) => fileName);

if (entryPoints.length === 0) {
  throw new Error('Could not find the src/main.ts entry point in dist/stats.json.');
}

const initialFiles = new Set();
const filesToVisit = [...entryPoints];

while (filesToVisit.length > 0) {
  const fileName = filesToVisit.pop();
  if (!fileName || initialFiles.has(fileName) || !outputs[fileName]) {
    continue;
  }

  initialFiles.add(fileName);
  outputs[fileName].imports?.filter(({kind}) => kind === 'import-statement').forEach(({path}) => filesToVisit.push(path));
}

const arcGisModules = new Set();
const markerFiles = [];

for (const fileName of initialFiles) {
  Object.keys(outputs[fileName].inputs ?? {})
    .filter((input) => input.includes('node_modules/@arcgis/core/'))
    .forEach((input) => arcGisModules.add(input));

  const outputPath = [resolve(outputDirectory, fileName), resolve(outputDirectory, 'browser', fileName)].find(existsSync);
  if (outputPath?.endsWith('.js') && readFileSync(outputPath, 'utf8').includes('esri-view-root')) {
    markerFiles.push(fileName);
  }
}

if (arcGisModules.size > 0 || markerFiles.length > 0) {
  console.error('ArcGIS code was found in the initial JavaScript graph.');
  console.error([...arcGisModules].join('\n'));
  console.error(markerFiles.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${initialFiles.size} initial files: no @arcgis/core modules or ArcGIS markers found.`);
}
