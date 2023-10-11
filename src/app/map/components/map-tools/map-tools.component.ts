import {Component, OnDestroy, OnInit} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/factories/tooltip-map-tools-and-controls.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {ToolMenuVisibility} from '../../../shared/types/tool-menu-visibility.type';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectToolMenuVisibility} from '../../../state/map/reducers/map-ui.reducer';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryMapToolsAndControls, deps: [ConfigService]}],
})
export class MapToolsComponent implements OnInit, OnDestroy {
  public toolMenuVisibility: ToolMenuVisibility | undefined = undefined;
  private readonly toolMenuVisibility$ = this.store.select(selectToolMenuVisibility);
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

  public toggleToolMenu(toolToToggle: ToolMenuVisibility) {
    const tool: ToolMenuVisibility | undefined = this.toolMenuVisibility === toolToToggle ? undefined : toolToToggle;
    this.store.dispatch(MapUiActions.toggleToolMenu({tool: tool}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.toolMenuVisibility$.pipe(tap((toolMenuVisibility) => (this.toolMenuVisibility = toolMenuVisibility))).subscribe(),
    );
  }
}
