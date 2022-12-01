import {Component, Input} from '@angular/core';
import {Legend} from '../../../../shared/models/gb3-api.interfaces';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent {
  @Input() public legendItem!: Legend;
  private readonly geoLionBaseUrl = environment.baseUrls.geoLion;
  private readonly geoLionEndPoint = 'geodatensatz/show?gdsid=';

  constructor() {}

  public getGeoLionLink(id: number): string {
    return `${this.geoLionBaseUrl}/${this.geoLionEndPoint}${id}`;
  }
}
