import {Component, Input} from '@angular/core';

@Component({
  selector: 'descriptive-highlighted-link',
  templateUrl: './descriptive-highlighted-link.component.html',
  styleUrls: ['./descriptive-highlighted-link.component.scss'],
})
export class DescriptiveHighlightedLinkComponent {
  @Input() public title!: string;
  @Input() public description?: string;
}