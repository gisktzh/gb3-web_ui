import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, tap} from 'rxjs';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {selectLinks} from '../../../state/support/reducers/support-content.reducer';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
})
export class UsefulInformationComponent implements OnInit, OnDestroy {
  public usefulLinksGroups: LinksGroup[] = [];
  private readonly usefulLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectLinks);
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
      this.usefulLinksGroups$
        .pipe(
          tap((usefulLinks) => {
            this.usefulLinksGroups = usefulLinks;
          }),
        )
        .subscribe(),
    );
  }
}
