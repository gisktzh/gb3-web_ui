import {Component, Input} from '@angular/core';

@Component({
  selector: 'hero-header',
  templateUrl: './hero-header.component.html',
  styleUrls: ['./hero-header.component.scss'],
})
export class HeroHeaderComponent {
  @Input() public heroTitle: string = '';
  @Input() public heroText: string = '';
  @Input() public heroSubText?: string;
}
