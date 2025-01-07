import {Component, Input} from '@angular/core';

@Component({
  selector: 'descriptive-highlighted-link',
  templateUrl: './descriptive-highlighted-link.component.html',
  styleUrls: ['./descriptive-highlighted-link.component.scss'],
  standalone: false,
})
export class DescriptiveHighlightedLinkComponent {
  @Input() public title!: string;
  @Input() public description?: string;
  @Input() public id?: number;
  @Input() public multiLine: boolean = false;
}
