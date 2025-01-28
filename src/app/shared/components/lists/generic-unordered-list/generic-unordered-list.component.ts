import {Component, Input, TemplateRef} from '@angular/core';
import {NgClass, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'generic-list',
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './generic-unordered-list.component.html',
  styleUrl: './generic-unordered-list.component.scss',
})
export class GenericUnorderedListComponent {
  @Input() public listData: any[] = [];
  @Input() public itemTemplate: TemplateRef<any> | null = null;
  @Input() public hasGap: boolean = false;
}
