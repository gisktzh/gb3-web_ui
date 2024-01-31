/**
 * This script is executed as part of the npm lifecycle script `prepare` which runs before the package is packed.
 * For more information see: https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts
 */

/**
 * Install husky only if the npm was called without omitting 'dev'
 * Or in other words: install husky only in a development environment
 *
 * For more information see: https://typicode.github.io/husky/how-to.html#ci-server-and-docker
 */
const installHusky = process.env.npm_config_omit !== 'dev';
if (installHusky) {
  const husky = (await import('husky')).default;
  console.log(husky());
}
