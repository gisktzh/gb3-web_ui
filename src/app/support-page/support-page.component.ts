import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {SupportPage} from '../shared/enums/support-page.enum';
import {ScreenMode} from '../shared/types/screen-size.type';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';

const SUPPORT_PAGE_SUMMARY =
  'Herzlich Willkommen im neuen GIS-Browser! Wir verstehen, dass die Verwendung eines neuen Tools manchmal überwältigend sein kann, aber keine Sorge, wir sind hier, um Ihnen zu helfen. Unser Ziel ist es, Ihnen eine nahtlose und benutzerfreundliche Erfahrung zu bieten, damit Sie schnell und einfach auf die gewünschten Informationen zugreifen können. In diesem Hilfe- und Support-Bereich finden Sie alle Informationen, die Sie benötigen, um den neuen Kartenviewer zu nutzen.';

@Component({
  selector: 'support-page',
  templateUrl: './support-page.component.html',
  styleUrls: ['./support-page.component.scss'],
})
export class SupportPageComponent implements OnInit, OnDestroy {
  protected readonly supportPageEnum = SupportPage;
  public heroText = SUPPORT_PAGE_SUMMARY;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
