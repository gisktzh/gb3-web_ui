import {Component} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from '../shared/types/print-type';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService]
})
export class MapPageComponent {
  constructor(private readonly mapConfigUrlService: MapConfigUrlService) {}

  public showPrint(printType: PrintType) {
    this.mapConfigUrlService.activatePrintMode(printType);
  }
}
