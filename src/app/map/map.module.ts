import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {LayerWidgetComponent} from './components/layer-widget/layer-widget.component';

@NgModule({
  declarations: [MapComponent, LayerWidgetComponent],
  imports: [CommonModule, SharedModule],
  exports: [MapComponent, LayerWidgetComponent]
})
export class MapModule {}
