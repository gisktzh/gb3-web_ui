import {Component, input, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'generic-list',
  imports: [NgTemplateOutlet],
  templateUrl: './generic-unordered-list.component.html',
  styleUrl: './generic-unordered-list.component.scss',
})
export class GenericUnorderedListComponent<T> {
  public listData = input<T[]>([]);
  public itemTemplate = input<TemplateRef<unknown> | null>(null);
  public hasGap = input(false);
}
