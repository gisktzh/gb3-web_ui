import {Component, Input} from '@angular/core';

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
}
