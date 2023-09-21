import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {Map} from '../../../shared/interfaces/topic.interface';
import {Store} from '@ngrx/store';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {selectMapConfigState} from '../../../state/map/reducers/map-config.reducer';
import {Subscription, tap} from 'rxjs';
import {MapConfigState} from '../../../state/map/states/map-config.state';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {FaqItem} from '../../../shared/interfaces/faq.interface';
import {SupportPage} from '../../../shared/enums/support-page.enum';

@Component({
  selector: 'start-page-search-result-group',
  templateUrl: './start-page-search-result-group.component.html',
  styleUrls: ['./start-page-search-result-group.component.scss'],
})
export class StartPageSearchResultGroup implements OnInit, OnDestroy {
  @Input() public header: string = '';
  @Input() public filteredMetadataItems: OverviewMetadataItem[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public filteredFaqItems: FaqItem[] = [];
  @Input() public searchTerms: string[] = [];

  public mapConfigState?: MapConfigState;
  protected readonly mainPageEnum = MainPage;
  protected readonly supportPageEnum = SupportPage;
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
