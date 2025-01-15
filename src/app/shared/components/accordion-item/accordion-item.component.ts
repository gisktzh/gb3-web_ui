import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';
import {CdkAccordionItem} from '@angular/cdk/accordion';

/**
 * Implements the KTZH accordion style; to be used with a cdk-accordion element.
 */
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
  standalone: false,
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  /**
   * Defines the color of the borders and the text:
   * * Light = white borders, white font
   * * Dark = dark borders, black font
   */
  @Input() public variant: 'light' | 'dark' | 'grey' = 'light';
  @Input() public header!: string;
  public ariaIdentifier!: string;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild('accordionItem') accordionItem!: CdkAccordionItem;

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    // generate identifier without custom characters and stuff for aria identification
    this.ariaIdentifier = btoa(this.header);
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggle(event: Event) {
    event.preventDefault();

    // programmatically click the element if it is a link to handle both space and enter key navigation
    if (event.target instanceof HTMLAnchorElement) {
      event.target.click();
    } else {
      this.accordionItem.toggle();
    }
  }
}
