import {animate, style, transition, trigger} from '@angular/animations';

export const slideInOutAnimation = [
  trigger('slideInOut', [
    transition(':enter', [
      // slide in transition
      style({opacity: 0, height: '0'}),
      animate('200ms', style({height: '*'})),
      animate('100ms', style({opacity: 1})),
    ]),
    transition(':leave', [
      // slide out transition
      style({opacity: 1, height: '*'}),
      animate('100ms', style({opacity: 0})),
      animate('200ms', style({height: '0'})),
    ]),
  ]),
];
