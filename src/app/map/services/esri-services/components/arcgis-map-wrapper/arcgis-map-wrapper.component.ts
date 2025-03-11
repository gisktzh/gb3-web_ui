import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-scale-bar';

@Component({
  selector: 'arcgis-map-wrapper',
  templateUrl: './arcgis-map-wrapper.component.html',
  styleUrls: ['./arcgis-map-wrapper.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Set the schema here
})
export class ArcgisMapWrapperComponent {}
