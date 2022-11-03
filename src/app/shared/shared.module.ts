import {NgModule} from '@angular/core';
import {EsriModule} from './external/esri.module';

@NgModule({
  declarations: [],
  imports: [EsriModule],
  exports: [EsriModule]
})
export class SharedModule {}
