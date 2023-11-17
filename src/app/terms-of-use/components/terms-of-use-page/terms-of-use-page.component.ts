import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

const TERMS_OF_USE_SUMMARY =
  'Geoinformationen sind verlässliche, raumbezogene Daten und Karten. Sie dienen als wichtige Grundlage für vielfältige Aufgaben und Entscheide und stehen über verschiedene Portale zur Einsicht und Nutzung bereit.';

@Component({
  selector: 'terms-of-use-page',
  templateUrl: './terms-of-use-page.component.html',
  styleUrls: ['./terms-of-use-page.component.scss'],
})
export class TermsOfUsePageComponent {
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
