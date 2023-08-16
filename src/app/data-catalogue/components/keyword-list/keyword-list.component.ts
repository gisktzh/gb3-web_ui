import {Component, Input} from '@angular/core';

@Component({
  selector: 'keyword-list',
  templateUrl: './keyword-list.component.html',
  styleUrls: ['./keyword-list.component.scss'],
})
export class KeywordListComponent {
  @Input() public listTitle?: string;
  @Input() public keywords: string[] = [];
}
