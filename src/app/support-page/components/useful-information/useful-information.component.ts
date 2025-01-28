import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {selectUsefulInformationLinksWithDynamicUrls} from '../../../state/support/selectors/useful-information-links.selector';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
  standalone: false,
})
export class UsefulInformationComponent implements OnInit, OnDestroy {
  public usefulInformationLinksGroups: LinksGroup[] = [];
  private readonly usefulInformationLinksGroups$ = this.store.select(selectUsefulInformationLinksWithDynamicUrls);
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
      this.usefulInformationLinksGroups$.pipe(tap((linksGroups) => (this.usefulInformationLinksGroups = linksGroups))).subscribe(),
    );
  }
}
