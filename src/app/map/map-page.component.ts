import {Component, OnInit} from '@angular/core';
import {MapConfigurationUrlService} from './services/map-configuration-url.service';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigurationUrlService]
})
export class MapPageComponent {
  constructor(private readonly mapConfigurationUrlService: MapConfigurationUrlService) {}
}
