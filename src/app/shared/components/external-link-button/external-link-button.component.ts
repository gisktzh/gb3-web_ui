import {Component, Input, ViewChild} from '@angular/core';
import {MatIconAnchor} from '@angular/material/button';

@Component({
  selector: 'external-link-button',
  templateUrl: './external-link-button.component.html',
  styleUrls: ['./external-link-button.component.scss'],
  standalone: false,
})
export class ExternalLinkButtonComponent {
  @Input() public url!: string;
  @Input() public size: 'small' | 'regular' = 'regular';
  @Input() public highlighted: boolean = false;
  @Input() public color: 'primary' | 'accent' = 'primary';
  @Input() public toolTip?: string;
  @Input() public disableTabFocus: boolean = false;
  @ViewChild('anchor') public readonly anchor!: MatIconAnchor;
}
