import {Component, HostListener, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ToolMenuVisibility} from '../../../../shared/types/tool-menu-visibility.type';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {selectToolMenuVisibility} from '../../../../state/map/reducers/map-ui.reducer';
import {selectReady} from '../../../../state/map/reducers/map-config.reducer';
import {TypedTourAnchorDirective} from '../../../../shared/directives/typed-tour-anchor.directive';
import {MatIconButton} from '@angular/material/button';
import {NgClass} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MeasurementToolsComponent} from '../measurement-tools/measurement-tools.component';
import {DrawingToolsComponent} from '../drawing-tools/drawing-tools.component';
import {DataDownloadSelectionToolsComponent} from '../data-download-selection-tools/data-download-selection-tools.component';
import {ToolType} from 'src/app/shared/types/tool.type';
import {selectActiveTool} from 'src/app/state/map/reducers/tool.reducer';

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
  imports: [
    TypedTourAnchorDirective,
    MatIconButton,
    NgClass,
    MatTooltip,
    MatIcon,
    MatDivider,
    MeasurementToolsComponent,
    DrawingToolsComponent,
    DataDownloadSelectionToolsComponent,
  ],
})
export class MapToolsDesktopComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  public isMapReady: boolean = true;

  public tooltipText = TOOLTIP_TEXT;

  private readonly toolMenuVisibility$ = this.store.select(selectToolMenuVisibility);
  private readonly isMapReady$ = this.store.select(selectReady);
  private readonly activeTool$ = this.store.select(selectActiveTool);
  private readonly subscriptions: Subscription = new Subscription();
  public activeTool: ToolType | undefined = undefined;

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

  @HostListener('window:keydown.control.p', ['$event'])
  public showPrintDialog(event?: KeyboardEvent) {
    if (event) {
      event.preventDefault();
    }

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
    this.subscriptions.add(this.activeTool$.pipe(tap((activeTool) => (this.activeTool = activeTool))).subscribe());
  }
}
