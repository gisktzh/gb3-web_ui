import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';

@Component({
  selector: 'search-result-entry-map',
  templateUrl: './search-result-entry-map.component.html',
  styleUrls: ['./search-result-entry-map.component.scss'],
  standalone: false,
})
export class SearchResultEntryMapComponent implements OnInit, OnDestroy {
  @Input() public filteredMaps: Map[] = [];

  public mapConfigState?: MapConfigState;
  protected readonly mainPageEnum = MainPage;
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
