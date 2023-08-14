import {Component, Input, OnInit} from '@angular/core';

/**
 * Implements the KTZH accordion style; to be used with a cdk-accordion element.
 */
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
})
export class AccordionItemComponent implements OnInit {
  /**
   * Defines the color of the borders and the text:
   * * Light = white borders, white font
   * * Dark = dark borders, black font
   */
  @Input() public variant: 'light' | 'dark' = 'light';
  @Input() public header!: string;
  public ariaIdentifier!: string;

  public ngOnInit() {
    // generate identifier without custom characters and stuff for aria identification
    this.ariaIdentifier = btoa(this.header);
  }
}
