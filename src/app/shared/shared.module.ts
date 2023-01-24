import {NgModule} from '@angular/core';
import {EsriModule} from './external/esri.module';
import {MaterialModule} from './external/material.module';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';

@NgModule({
  declarations: [BasemapImageLinkPipe],
  imports: [EsriModule, MaterialModule],
  exports: [EsriModule, MaterialModule, BasemapImageLinkPipe]
})
export class SharedModule {}
