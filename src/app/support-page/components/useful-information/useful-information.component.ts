import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {selectUsefulInformationLinksWithDynamicUrls} from '../../../state/support/selectors/useful-information-links.selector';
import {LinkListComponent} from '../../../shared/components/lists/link-list/link-list.component';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
  imports: [LinkListComponent],
})
export class UsefulInformationComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public usefulInformationLinksGroups: LinksGroup[] = [];
  private readonly usefulInformationLinksGroups$ = this.store.select(selectUsefulInformationLinksWithDynamicUrls);
  private readonly subscriptions: Subscription = new Subscription();

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
