import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'disable-overscroll-behaviour',
  standalone: true,
  templateUrl: './disable-overscroll-behaviour.component.html',
  styleUrls: ['./disable-overscroll-behaviour.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class DisableOverscrollBehaviourComponent {}
