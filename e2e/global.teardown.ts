import * as fs from 'node:fs';
import * as path from 'node:path';
import {redactAny} from './utils/redact.utils';
import {canonicalizeHar} from './utils/canonicalize.utils';

/**
 * Removes all occurrences of `target` from every file in `dirPath`.
 * Assumes no nested directories.
 */
export function redactFromHARFiles(): void {
  // Not writing HAR, no need to redact.
  if (!process.env['WRITE_HAR']) {
    return;
  }

  const dirPath = './e2e/hars';

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isFile()) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const redactedContent = redactAny(content);
      const canonicalContent = canonicalizeHar(redactedContent);

      fs.writeFileSync(filePath, JSON.stringify(canonicalContent, null, 2), 'utf-8');
    }
  });
}

export default redactFromHARFiles;
