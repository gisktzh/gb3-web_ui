import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, tap} from 'rxjs';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {selectUsefulInformationLinks} from '../../../state/support/reducers/support-content.reducer';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
})
export class UsefulInformationComponent implements OnInit, OnDestroy {
  public usefulInformationLinksGroups: LinksGroup[] = [];
  private readonly usefulInformationLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectUsefulInformationLinks);
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
      this.usefulInformationLinksGroups$
        .pipe(
          tap((usefulLinks) => {
            this.usefulInformationLinksGroups = usefulLinks;
          }),
        )
        .subscribe(),
    );
  }
}
