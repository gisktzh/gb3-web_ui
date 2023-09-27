import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {Subscription, tap} from 'rxjs';
import {selectToolMenuVisibility} from '../../../state/map/reducers/map-ui.reducer';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
})
export class MapToolsComponent implements OnInit, OnDestroy {
  public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  public screenMode: ScreenMode = 'regular';

  private readonly toolMenuVisibility$ = this.store.select(selectToolMenuVisibility);
  private readonly screenMode$ = this.store.select(selectScreenMode);
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

  public showShareLinkDialog() {
    this.store.dispatch(MapUiActions.showShareLinkDialog());
  }

  public showShareLinkBottomSheet() {
    this.store.dispatch(MapUiActions.showBottomSheetOverlay({bottomSheetHeight: BottomSheetHeight.small}));
  }

  public toggleLegend() {}

  public locateClient() {}

  public goToInitialExtent() {}

  public toggleToolMenu(toolToToggle: ToolMenuVisibility) {
    const tool: ToolMenuVisibility | undefined = this.toolMenuVisibility === toolToToggle ? undefined : toolToToggle;
    this.store.dispatch(MapUiActions.toggleToolMenu({tool: tool}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.toolMenuVisibility$.pipe(tap((toolMenuVisibility) => (this.toolMenuVisibility = toolMenuVisibility))).subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
