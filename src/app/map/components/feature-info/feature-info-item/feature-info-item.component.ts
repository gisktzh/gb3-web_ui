import {Component, Input} from '@angular/core';
import {FeatureInfoResult, FeatureInfoResultFeature, FeatureInfoResultFeatureField} from '../../../../shared/models/gb3-api.interfaces';
import {MapService} from '../../../services/map.service';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import {GeoJSONMapperServiceService} from '../../../../shared/services/geo-json-mapper-service.service';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss']
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResult;

  constructor(private readonly mapService: MapService, private readonly geoJSONMapperService: GeoJSONMapperServiceService) {}
  public highlightFeature(feature: FeatureInfoResultFeature): void {
    const geometry = this.geoJSONMapperService.fromGeoJSONToEsri(feature.geometry);
    const graphic = new Graphic({
      geometry: geometry
    });
    this.mapService.highlightFeature(geometry);
  }
}
