import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

const PRIVACY_SUMMARY =
  'In den Informationen und Richtlinien zum Datenschutz finden Sie die Angaben zur Verarbeitung personenbezogener Daten, den Umfang der Datenverarbeitung, die Verwendung von Cookies und was alles bei der Registrierung gespeichert wird.';

@Component({
  selector: 'privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
})
export class PrivacyPageComponent implements OnInit, OnDestroy {
  public heroText = PRIVACY_SUMMARY;
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
