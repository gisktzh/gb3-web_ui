import {Component, CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';
import '@arcgis/map-components/components/arcgis-scale-bar';

@Component({
  selector: 'arcgis-scale-bar-wrapper',
  templateUrl: './arcgis-scale-bar-wrapper.component.html',
  styleUrls: ['./arcgis-scale-bar-wrapper.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Set the schema here
})
export class ArcgisScaleBarWrapperComponent {
  @Input() public scaleBarRef: any;
}
