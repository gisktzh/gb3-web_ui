import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

export interface TitleLink {
  url: string;
  displayTitle: string;
}

@Component({
  selector: 'page-section',
  templateUrl: './page-section.component.html',
  styleUrls: ['./page-section.component.scss'],
  standalone: false,
})
export class PageSectionComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public background?: 'primary' | 'accent';
  @Input() public sectionTitle?: string;
  @Input() public titleLink?: TitleLink;
  @Input() public hideBottomPadding: boolean = false;
  @Input() public pageTitle: boolean = false;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
