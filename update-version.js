const fs = require('fs');
const cp = require('child_process');

const PATH_TO_VERSION_FILE = './src/version.ts';

function extractGitCommitHash() {
  try {
    return cp.execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    console.log('Could not extract hash, reason:\n' + e.message);
    console.log('Returning default hash');
    return 'UNKNOWN_BUILD';
  }
}

function extractLastTag() {
  try {
    return cp.execSync('git describe --tags $(git rev-list --tags --max-count=1)').toString().trim();
  } catch (e) {
    console.log('No tag found, reason:\n' + e.message);
    return undefined;
  }
}

const commitHash = extractGitCommitHash();
const tag = extractLastTag();

console.log('Setting build to:' + commitHash + ' | Setting release to: ' + tag);

fs.readFile(PATH_TO_VERSION_FILE, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading version file.');
    throw err;
  }

  let updatedData = data.replace(/LOCAL_DEV_VERSION/g, commitHash);
  updatedData = updatedData.replace(/LOCAL_DEV_RELEASE/g, tag);

  fs.writeFile(PATH_TO_VERSION_FILE, updatedData, 'utf-8', (err) => {
    if (err) {
      console.error('Error writing version file.');
      throw err;
    }
  });
});
