import {Component, HostListener, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Store} from '@ngrx/store';
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
export class MapToolsDesktopComponent {
  private readonly store = inject(Store);

  // public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  public toolMenuVisibility = toSignal(this.store.select(selectToolMenuVisibility), {initialValue: undefined});
  public isMapReady = toSignal(this.store.select(selectReady), {initialValue: false});
  public activeTool = toSignal(this.store.select(selectActiveTool), {initialValue: undefined});

  public tooltipText = TOOLTIP_TEXT;

  public getVisibilityClassFor(tool: string) {
    return computed(() => (this.toolMenuVisibility() === tool ? 'map-tools-desktop__list__button--active' : ''));
  }

  public toggleToolMenu(toolToToggle: ToolMenuVisibility) {
    const tool: ToolMenuVisibility | undefined = this.toolMenuVisibility() === toolToToggle ? undefined : toolToToggle;
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
}
