import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, tap} from 'rxjs';
import {SupportLinkCollection} from '../../../shared/interfaces/support-link.interface';
import {selectLinks} from '../../../state/support/reducers/support-content.reducer';

@Component({
  selector: 'app-useful-links',
  templateUrl: './useful-links.component.html',
  styleUrls: ['./useful-links.component.scss']
})
export class UsefulLinksComponent implements OnInit, OnDestroy {
  public usefulLinksCollections: SupportLinkCollection[] = [];
  private readonly usefulLinksCollections$: Observable<SupportLinkCollection[]> = this.store.select(selectLinks);
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
      this.usefulLinksCollections$
        .pipe(
          tap((usefulLinks) => {
            this.usefulLinksCollections = usefulLinks;
          })
        )
        .subscribe()
    );
  }
}
