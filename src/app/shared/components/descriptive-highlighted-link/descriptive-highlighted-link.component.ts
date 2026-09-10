import {Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'descriptive-highlighted-link',
  templateUrl: './descriptive-highlighted-link.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./descriptive-highlighted-link.component.scss'],
})
export class DescriptiveHighlightedLinkComponent {
  public readonly title = input.required<string>();
  public readonly description = input<string>();
  public readonly id = input<number>();
  public readonly multiLine = input(false);
}
