import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

/**
 * Implements the KTZH accordion style; to be used with a cdk-accordion element.
 */
@Component({
  selector: 'accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
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

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    // generate identifier without custom characters and stuff for aria identification
    this.ariaIdentifier = btoa(this.header);
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
