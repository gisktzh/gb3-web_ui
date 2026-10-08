import {Component, input} from '@angular/core';
import {OerebExtractListItem} from 'src/app/map/types/oereb-extract-list-item.type';
import {OerebInfoValueComponent} from '../oereb-info-value/oereb-info-value.component';

@Component({
  selector: 'oereb-not-concerned-themes-list',
  templateUrl: './oereb-not-concerned-themes-list.component.html',
  styleUrls: ['./oereb-not-concerned-themes-list.component.scss'],
  imports: [OerebInfoValueComponent],
})
export class OerebNotConcernedThemesList {
  public readonly listItems = input.required<OerebExtractListItem[]>();
}
