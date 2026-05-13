import {Component, inject} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/factories/tooltip-map-tools-and-controls.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapToolsDesktopComponent} from './map-tools-desktop/map-tools-desktop.component';
import {MapToolsMobileComponent} from './map-tools-mobile/map-tools-mobile.component';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryMapToolsAndControls, deps: [ConfigService]}],
  imports: [MapToolsDesktopComponent, MapToolsMobileComponent],
})
export class MapToolsComponent {
  private readonly store = inject(Store);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
