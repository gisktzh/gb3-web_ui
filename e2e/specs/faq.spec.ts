import {test, expect, describeA11y} from '../fixtures';

const QUESTION = 'Was ist das Geoportal?';

test.describe('FAQ', () => {
  test('shows the FAQ overview and a single expanded question', async ({page, useHar, captureConsole, openFaqPage, toggleFaqQuestion}) => {
    await useHar();
    captureConsole();

    await openFaqPage();

    const question = page.locator('cdk-accordion-item').filter({hasText: QUESTION});
    await expect(question).toHaveAttribute('aria-expanded', 'false');

    await toggleFaqQuestion(QUESTION);

    await expect(question.locator('.faq__content')).toBeVisible();
  });

  describeA11y(() => {
    test('has no detectable accessibility violations on the overview and with a question expanded', async ({
      useHar,
      captureConsole,
      openFaqPage,
      toggleFaqQuestion,
      checkA11y,
    }) => {
      await useHar();
      captureConsole();

      await openFaqPage();

      // First distinct state: the collapsed FAQ overview.
      await checkA11y();

      await toggleFaqQuestion(QUESTION);

      // Second distinct state: a single expanded question with its answer visible. Everything else on the page
      // (nav, footer, other questions) is unchanged and was already scanned above, so scope this scan to just the
      // now-expanded item.
      await checkA11y({include: ['cdk-accordion-item[aria-expanded="true"]']});
    });
  });
});
