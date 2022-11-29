import {Component, Input} from '@angular/core';
import {Legend} from '../../../../shared/services/apis/gb3/gb3-api.interfaces';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent {
  @Input() public legendItem!: Legend;
  private readonly geoLionBaseUrl = 'https://www.geolion.zh.ch/geodatensatz/show?gdsid=';

  constructor() {}

  public getGeoLionLink(id: number): string {
    return `${this.geoLionBaseUrl}${id}`;
  }
}
