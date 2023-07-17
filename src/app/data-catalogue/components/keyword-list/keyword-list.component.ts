import {Component, Input} from '@angular/core';

/**
 * Takes a string and generates a keyword list by splitting the list at ,-characters.
 */
@Component({
  selector: 'keyword-list',
  templateUrl: './keyword-list.component.html',
  styleUrls: ['./keyword-list.component.scss'],
})
export class KeywordListComponent {
  @Input() public keywords: string[] = [];
}
