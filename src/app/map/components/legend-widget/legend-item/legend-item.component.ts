import {Component, Input, OnInit} from '@angular/core';
import {Legend} from '../../../../shared/services/apis/gb3/gb3-api.interfaces';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent implements OnInit {
  @Input() public legendItem!: Legend;

  constructor() {}

  ngOnInit(): void {}
}
