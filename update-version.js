const fs = require('fs');
const cp = require('child_process');

const PATH_TO_VERSION_FILE = './src/version.ts';

/**
 * Creates the app version:
 * * If APP_VERSION environment variable is set, returns this value
 * * Otherwise, tries to extract the last git commit hash (--short)
 * * If that fails, returns 'UNKNOWN_VERSION'
 * @returns string
 */
function createAppVersion() {
  if (process.env.APP_VERSION) {
    console.log('Found APP_VERSION environment variable, using this as version...');
    return process.env.APP_VERSION;
  }
  try {
    console.log('Extracting git commit hash as app version...');
    return cp.execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    console.log('Could not extract hash, reason:\n' + e.message);
    console.log('Returning default hash');
    return 'UNKNOWN_VERSION';
  }
}

/**
 * Creates the release ID:
 * * If APP_RELEASE environment variable is set, returns this value
 * * Otherwise, tries to extract the last git tag
 * * If that fails, returns an empty string
 * @returns undefined|string
 */
function createReleaseId() {
  if (process.env.APP_RELEASE) {
    console.log('Found APP_RELEASE environment variable, using this as version...');
    return process.env.APP_RELEASE;
  }
  try {
    console.log('Extracting last tag as release...');
    return cp.execSync('git describe --tags $(git rev-list --tags --max-count=1)').toString().trim();
  } catch (e) {
    console.log('No tag found, reason:\n' + e.message);
    return '';
  }
}

const appVersion = createAppVersion();
const tag = createReleaseId();

console.log('Setting version to:' + appVersion + ' | Setting release to: ' + tag);

fs.readFile(PATH_TO_VERSION_FILE, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading version file.');
    throw err;
  }

  let updatedData = data.replace(/LOCAL_DEV_VERSION/g, appVersion);
  updatedData = updatedData.replace(/LOCAL_DEV_RELEASE/g, tag);

  fs.writeFile(PATH_TO_VERSION_FILE, updatedData, 'utf-8', (err) => {
    if (err) {
      console.error('Error writing version file.');
      throw err;
    }
  });
});
