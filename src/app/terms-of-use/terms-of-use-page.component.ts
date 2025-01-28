import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

const TERMS_OF_USE_SUMMARY =
  'Diese Nutzungshinweise gelten für die Website zh.ch und deren direkte Unterseiten, ausser, es wird für eine konkrete Seite bzw. für ein konkretes Angebot ausdrücklich etwas Abweichendes bekannt gegeben.';

@Component({
  selector: 'terms-of-use-page',
  templateUrl: './terms-of-use-page.component.html',
  styleUrls: ['./terms-of-use-page.component.scss'],
  standalone: false,
})
export class TermsOfUsePageComponent implements OnInit, OnDestroy {
  public heroText = TERMS_OF_USE_SUMMARY;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
