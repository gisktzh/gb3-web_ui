import {Component, Input} from '@angular/core';

/**
 * Implements the KTZH accordion style; to be used with a cdk-accordion element.
 */
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
})
export class AccordionItemComponent {
  @Input() public variant: 'light' | 'dark' = 'light';
  @Input() public header: string = '';
}
