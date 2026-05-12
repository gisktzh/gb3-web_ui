import {Component, input} from '@angular/core';

@Component({
  selector: 'descriptive-highlighted-link',
  templateUrl: './descriptive-highlighted-link.component.html',
  styleUrls: ['./descriptive-highlighted-link.component.scss'],
})
export class DescriptiveHighlightedLinkComponent {
  public title = input.required<string>();
  public description = input<string>();
  public id = input<number>();
  public multiLine = input(false);
}
