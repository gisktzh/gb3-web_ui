import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, tap} from 'rxjs';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {selectUsefulInformationLinks} from '../../../state/support/reducers/support-content.reducer';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
})
export class UsefulInformationComponent implements OnInit, OnDestroy {
  public usefulInformationLinksGroups: LinksGroup[] = [];
  private readonly usefulInformationLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectUsefulInformationLinks);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
  ) {}

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
          tap(
            (linksGroups) =>
              (this.usefulInformationLinksGroups = linksGroups.map((linksGroup) => {
                return {
                  ...linksGroup,
                  links: linksGroup.links.map((link) => {
                    if (link.baseUrl) {
                      if (link.baseUrl === 'Geolion') {
                        return {...link, href: this.configService.apiConfig.geoLion.baseUrl + link.href};
                      }
                    }
                    return link;
                  }),
                };
              })),
          ),
        )
        .subscribe(),
    );
  }
}
