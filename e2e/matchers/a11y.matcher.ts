import {expect as baseExpect, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// WCAG 2.2 AA is a superset of the 2.0/2.1 A+AA success criteria, so all of these tags need to be
// requested to get the full rule set axe-core ships for that conformance target.
const WCAG_22_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type CheckA11yOptions = {
  /** CSS selector(s) to scope the scan to. Useful for widgets rendered outside the main page flow, e.g. dialogs/overlays. */
  include?: string[];
  /**
   * CSS selector(s) to exclude from the scan, e.g. known third-party widgets (ArcGIS canvas/WebGL controls) that
   * can't be remediated by us. Use sparingly and document why in the call site.
   */
  exclude?: string[];
};

/**
 * Renders a compact, actionable summary of axe-core violations so that failures are understandable directly from
 * the CI log/assertion message, without needing to dig into the attached JSON report.
 */
function formatViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `      - ${node.target.join(' ')}\n        ${node.failureSummary?.replaceAll('\n', '\n        ')}`)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

export const expect = baseExpect.extend({
  async toNotHaveAccessibilityViolations(page: Page, options?: CheckA11yOptions) {
    let builder = new AxeBuilder({page}).withTags(WCAG_22_AA_TAGS);

    for (const selector of options?.include ?? []) {
      builder = builder.include(selector);
    }

    for (const selector of options?.exclude ?? []) {
      builder = builder.exclude(selector);
    }

    const results = await builder.analyze();

    if (results.violations.length > 0) {
      // Attach axe results here, if desired.
    }

    return {
      pass: results.violations.length === 0,
      message: () => `Accessibility violations found:\n\n${formatViolations(results.violations)}`,
    };
  },
});
