import {Component, Input} from '@angular/core';

export interface TitleLink {
  url: string;
  displayTitle: string;
}
@Component({
  selector: 'start-page-section',
  templateUrl: './start-page-section.component.html',
  styleUrls: ['./start-page-section.component.scss']
})
export class StartPageSectionComponent {
  @Input() public background?: 'primary' | 'accent';
  @Input() public sectionTitle?: string;
  @Input() public titleLink?: TitleLink;
  @Input() public hideBottomPadding: boolean = false;
}
