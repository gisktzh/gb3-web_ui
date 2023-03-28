import {Component, Input} from '@angular/core';
import {Legend} from '../../../../shared/interfaces/legend.interface';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent {
  @Input() public legendItem!: Legend;
  @Input() public isPrintable: boolean = false;
  private readonly dataTabUrl = '/data/geodata';

  constructor() {}

  public getDataTabLink(id: number): string {
    return `${this.dataTabUrl}/${id}`;
  }
}
