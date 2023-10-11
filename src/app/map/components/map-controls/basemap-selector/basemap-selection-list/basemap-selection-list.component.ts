import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {Basemap} from '../../../../../shared/interfaces/basemap.interface';
import {MapConfigActions} from '../../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../../services/basemap-config.service';

@Component({
  selector: 'basemap-selection-list',
  templateUrl: './basemap-selection-list.component.html',
  styleUrls: ['./basemap-selection-list.component.scss'],
})
export class BasemapSelectionListComponent implements OnInit, OnDestroy {
  public activeBasemap?: Basemap;
  public availableBasemaps: Basemap[] = [];

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);

  constructor(
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService,
  ) {
    this.availableBasemaps = this.basemapConfigService.availableBasemaps;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigActions.setBasemap({activeBasemapId: toId}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          tap((activeBasemapId) => {
            this.activeBasemap = this.availableBasemaps.find((basemap) => basemap.id === activeBasemapId);
          }),
        )
        .subscribe(),
    );
  }
}
