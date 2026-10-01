import {Component, input} from '@angular/core';
import {OerebExtractListItem} from 'src/app/map/types/oereb-extract-list-item.type';

@Component({
  selector: 'oereb-info-value',
  templateUrl: './oereb-info-value.component.html',
  styleUrls: ['./oereb-info-value.component.scss'],
})
export class OerebInfoValueComponent {
  public readonly item = input.required<OerebExtractListItem>();
}
