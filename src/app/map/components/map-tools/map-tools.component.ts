import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {Subscription, tap} from 'rxjs';
import {selectToolMenuVisibility} from '../../../state/map/reducers/map-ui.reducer';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectLoadingState} from 'src/app/state/map/reducers/legend.reducer';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {selectQueryLegends} from 'src/app/state/map/selectors/query-legends.selector';
import {GeolocationActions} from 'src/app/state/map/actions/geolocation.actions';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
})
export class MapToolsComponent implements OnInit, OnDestroy {
  public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  public screenMode: ScreenMode = 'regular';
  public loadingState?: LoadingState;
  public numberOfQueryLegends: number = 0;

  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly toolMenuVisibility$ = this.store.select(selectToolMenuVisibility);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly laodingState$ = this.store.select(selectLoadingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showPrintDialog() {
    this.store.dispatch(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'print'}));
  }

  public showShareLink() {
    this.store.dispatch(MapUiActions.showShareLinkDialog());
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  }

  public locateClient() {
    this.store.dispatch(GeolocationActions.startLocationRequest());
  }

  public toggleSelection() {
    this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'basemap'}));
  }

  public toggleToolMenu(toolToToggle: ToolMenuVisibility) {
    const tool: ToolMenuVisibility | undefined = this.toolMenuVisibility === toolToToggle ? undefined : toolToToggle;
    this.store.dispatch(MapUiActions.toggleToolMenu({tool: tool}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.toolMenuVisibility$.pipe(tap((toolMenuVisibility) => (this.toolMenuVisibility = toolMenuVisibility))).subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.laodingState$
        .pipe(
          tap((loadingState) => {
            this.loadingState = loadingState;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.queryLegends$
        .pipe(
          tap((currentActiveMapItems) => {
            this.numberOfQueryLegends = currentActiveMapItems.length;
          }),
        )
        .subscribe(),
    );
  }
}
