import {Component, Input, TemplateRef} from '@angular/core';
import {NgForOf, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'generic-list',
  standalone: true,
  imports: [NgForOf, NgTemplateOutlet],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.scss',
})
export class GenericListComponent {
  @Input() public listData: any[] = [];
  @Input() public itemTemplate: TemplateRef<any> | null = null;
}
