import {Component, Input} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {Legend} from '../../../../shared/interfaces/legend.interface';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent {
  @Input() public legendItem!: Legend;
  @Input() public isPrintable: boolean = false;
  private readonly geoLionBaseUrl = environment.baseUrls.geoLion;
  private readonly geoLionEndPoint = 'geodatensatz/show?gdsid=';

  constructor() {}

  public getGeoLionLink(id: number): string {
    return `${this.geoLionBaseUrl}/${this.geoLionEndPoint}${id}`;
  }
}
