import {Component, Input} from '@angular/core';

@Component({
  selector: 'gb2-exit-button',
  templateUrl: './gb2-exit-button.component.html',
  styleUrls: ['./gb2-exit-button.component.scss'],
})
export class Gb2ExitButtonComponent {
  @Input() public url!: string;
  @Input() public size: 'small' | 'regular' = 'regular';
  @Input() public highlighted: boolean = false;
  @Input() public color: 'primary' | 'accent' = 'primary';
}
