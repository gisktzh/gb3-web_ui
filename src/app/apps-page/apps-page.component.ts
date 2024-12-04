import {Component} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ExternalApp} from '../shared/interfaces/external-app.interface';
import {selectExternalApps} from '../state/external-apps/reducers/external-apps.reducer';

@Component({
  selector: 'apps-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './apps-page.component.html',
  styleUrl: './apps-page.component.scss',
})
export class AppsPageComponent {
  public externalApps: ExternalApp[] = [];
  private readonly externalApps$: Observable<ExternalApp[]> = this.store.select(selectExternalApps);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

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
