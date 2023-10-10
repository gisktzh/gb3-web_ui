import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {Basemap} from '../../../../shared/interfaces/basemap.interface';
import {DocumentService} from '../../../../shared/services/document.service';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../services/basemap-config.service';

@Component({
  selector: 'basemap-selector-mobile',
  templateUrl: './basemap-selector-mobile.component.html',
  styleUrls: ['./basemap-selector-mobile.component.scss'],
})
export class BasemapSelectorMobileComponent implements OnInit, OnDestroy {
  public activeBasemap?: Basemap;
  public availableBasemaps: Basemap[] = [];
  public isVisible: boolean = false;
  public screenMode: ScreenMode = 'mobile';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly documentService: DocumentService,
  ) {
    this.availableBasemaps = this.basemapConfigService.availableBasemaps;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
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

    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
  }
}
