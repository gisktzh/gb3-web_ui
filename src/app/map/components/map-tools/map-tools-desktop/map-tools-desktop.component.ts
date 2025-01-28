import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ToolMenuVisibility} from '../../../../shared/types/tool-menu-visibility.type';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {selectToolMenuVisibility} from '../../../../state/map/reducers/map-ui.reducer';
import {selectReady} from '../../../../state/map/reducers/map-config.reducer';

const TOOLTIP_TEXT = {
  measurement: 'Messen',
  drawing: 'Zeichnen',
  dataDownload: 'Daten beziehen',
  print: 'Drucken',
  share: 'Teilen',
  mapImport: 'Kartendienst importieren',
};

@Component({
  selector: 'map-tools-desktop',
  templateUrl: './map-tools-desktop.component.html',
  styleUrls: ['./map-tools-desktop.component.scss'],
  standalone: false,
})
export class MapToolsDesktopComponent implements OnInit, OnDestroy {
  public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  public isMapReady: boolean = true;

  public tooltipText = TOOLTIP_TEXT;

  private readonly toolMenuVisibility$ = this.store.select(selectToolMenuVisibility);
  private readonly isMapReady$ = this.store.select(selectReady);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleToolMenu(toolToToggle: ToolMenuVisibility) {
    const tool: ToolMenuVisibility | undefined = this.toolMenuVisibility === toolToToggle ? undefined : toolToToggle;
    this.store.dispatch(MapUiActions.toggleToolMenu({tool: tool}));
  }

  public showPrintDialog() {
    this.store.dispatch(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'print'}));
  }

  public showShareLinkDialog() {
    this.store.dispatch(MapUiActions.showShareLinkDialog());
  }

  public showMapImportDialog() {
    this.store.dispatch(MapUiActions.showMapImportDialog());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.toolMenuVisibility$.pipe(tap((toolMenuVisibility) => (this.toolMenuVisibility = toolMenuVisibility))).subscribe(),
    );
    this.subscriptions.add(this.isMapReady$.pipe(tap((ready) => (this.isMapReady = ready))).subscribe());
  }
}
