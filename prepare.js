/**
 * This script is executed as part of the npm lifecycle script `prepare` which runs before the package is packed.
 * For more information see: https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts
 */

/**
 * Install husky only if the npm was called without omitting 'dev'
 * Or in other words: install husky only in a development environment
 *
 * For more information see: https://typicode.github.io/husky/#/?id=with-a-custom-script
 */
const installHusky = process.env.npm_config_omit !== 'dev';
if (installHusky) {
  require('husky').install();
}
