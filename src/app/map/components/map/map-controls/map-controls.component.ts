import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../../../core/state/map/actions/map-configuration.actions';
import {ZoomType} from '../../../../shared/types/zoom-type';
import {Subscription, tap} from 'rxjs';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../../../../core/state/map/reducers/map-configuration.reducer';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent implements OnInit, OnDestroy {
  public isMaxZoomedIn: boolean = false;
  public isMaxZoomedOut: boolean = false;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public goToInitialExtent() {
    this.store.dispatch(MapConfigurationActions.resetExtent());
  }

  public handleZoom(zoomType: ZoomType) {
    this.store.dispatch(MapConfigurationActions.changeZoom({zoomType}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isMaxZoomedIn$.pipe(tap((value) => (this.isMaxZoomedIn = value))).subscribe());
    this.subscriptions.add(this.isMaxZoomedOut$.pipe(tap((value) => (this.isMaxZoomedOut = value))).subscribe());
  }
}
