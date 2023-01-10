import {Component} from '@angular/core';
import {MapConfigurationUrlService} from './services/map-configuration-url.service';
import {PrintType} from '../shared/types/print-type';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigurationUrlService]
})
export class MapPageComponent {
  constructor(private readonly mapConfigurationUrlService: MapConfigurationUrlService) {}

  public showPrint(printType: PrintType) {
    this.mapConfigurationUrlService.activatePrintMode(printType);
  }
}
