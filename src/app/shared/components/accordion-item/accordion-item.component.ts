import {Component, computed, inject, input, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {CdkAccordionItem} from '@angular/cdk/accordion';

import {MatIcon} from '@angular/material/icon';

/**
 * Implements the KTZH accordion style; to be used with a cdk-accordion element.
 */
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
  imports: [CdkAccordionItem, MatIcon],
})
export class AccordionItemComponent {
  private readonly store = inject(Store);

  /**
   * Defines the color of the borders and the text:
   * * Light = white borders, white font
   * * Dark = dark borders, black font
   */
  public readonly variant = input<'light' | 'dark' | 'grey'>('light');
  public readonly header = input.required<string>();
  public readonly ariaIdentifier = computed(() => btoa(this.header()));
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  private readonly accordionItem = viewChild.required<CdkAccordionItem>(CdkAccordionItem);

  public toggle(event: Event) {
    event.preventDefault();

    // programmatically click the element if it is a link to handle both space and enter key navigation
    if (event.target instanceof HTMLAnchorElement) {
      event.target.click();
    } else {
      this.accordionItem().toggle();
    }
  }
}
