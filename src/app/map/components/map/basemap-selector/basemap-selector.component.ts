import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectActiveBasemapId} from '../../../../core/state/map/reducers/map-configuration.reducer';
import {Basemap} from '../../../../shared/interfaces/background-map.interface';
import {defaultBasemaps} from '../../../../shared/configs/base-map-config';
import {MapConfigurationActions} from '../../../../core/state/map/actions/map-configuration.actions';

@Component({
  selector: 'basemap-selector',
  templateUrl: './basemap-selector.component.html',
  styleUrls: ['./basemap-selector.component.scss']
})
export class BasemapSelectorComponent implements OnInit, OnDestroy {
  public activeBasemapId: string = '';
  public isSelectionOpen: boolean = false;
  public availableBasemaps: Basemap[] = [];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleSelection() {
    this.isSelectionOpen = !this.isSelectionOpen;
  }

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigurationActions.setBasemap({activeBasemapId: toId}));
    this.toggleSelection();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          tap((activeBasemapId) => {
            this.activeBasemapId = activeBasemapId;
            this.availableBasemaps = defaultBasemaps.filter((defaultBasemap) => defaultBasemap.id !== activeBasemapId);
          })
        )
        .subscribe()
    );
  }
}
