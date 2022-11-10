import {NgModule} from '@angular/core';
import {EsriModule} from './external/esri.module';
import {MaterialModule} from './external/material.module';

@NgModule({
  declarations: [],
  imports: [EsriModule, MaterialModule],
  exports: [EsriModule, MaterialModule]
})
export class SharedModule {}
