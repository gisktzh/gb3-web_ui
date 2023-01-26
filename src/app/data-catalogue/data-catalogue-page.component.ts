import {Component, OnInit} from '@angular/core';
import {GeoLionService} from '../shared/services/apis/geolion/geo-lion.service';

@Component({
  selector: 'app-data-catalogue-page',
  templateUrl: './data-catalogue-page.component.html',
  styleUrls: ['./data-catalogue-page.component.scss']
})
export class DataCataloguePageComponent implements OnInit {
  constructor(private readonly geoLionService: GeoLionService) {}

  public async ngOnInit() {
    const data = await this.geoLionService.getOgd4zhwebData();
    console.log(data);
  }
}
