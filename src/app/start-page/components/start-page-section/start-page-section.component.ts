import {Component, Input} from '@angular/core';

@Component({
  selector: 'start-page-section',
  templateUrl: './start-page-section.component.html',
  styleUrls: ['./start-page-section.component.scss']
})
export class StartPageSectionComponent {
  @Input() public background?: 'primary' | 'secondary';
  @Input() public sectionTitle?: string;
}
