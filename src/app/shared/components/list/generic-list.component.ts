import {Component, Input, TemplateRef} from '@angular/core';
import {NgClass, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'generic-list',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.scss',
})
export class GenericListComponent {
  @Input() public listData: any[] = [];
  @Input() public itemTemplate: TemplateRef<any> | null = null;
  @Input() public hasGap: boolean = false;
}
