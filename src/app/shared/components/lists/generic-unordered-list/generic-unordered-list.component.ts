import {Component, input, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'generic-list',
  imports: [NgTemplateOutlet],
  templateUrl: './generic-unordered-list.component.html',
  styleUrl: './generic-unordered-list.component.scss',
})
export class GenericUnorderedListComponent<T> {
  public readonly listData = input<T[]>([]);
  public readonly itemTemplate = input<TemplateRef<unknown> | null>(null);
  public readonly hasGap = input(false);
}
