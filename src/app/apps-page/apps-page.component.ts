import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ExternalApp} from '../shared/interfaces/external-app.interface';
import {LinkGridListComponent} from '../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';
import {selectExternalAppsForAccessMode} from '../state/external-apps/selectors/external-apps.selector';

@Component({
  selector: 'apps-page',
  standalone: true,
  imports: [SharedModule, LinkGridListComponent, LinkGridListItemComponent],
  templateUrl: './apps-page.component.html',
  styleUrl: './apps-page.component.scss',
})
export class AppsPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public externalApps: ExternalApp[] = [];
  private readonly externalApps$: Observable<ExternalApp[]> = this.store.select(selectExternalAppsForAccessMode);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.externalApps$
        .pipe(
          tap((externalApps) => {
            this.externalApps = externalApps;
          }),
        )
        .subscribe(),
    );
  }
}
