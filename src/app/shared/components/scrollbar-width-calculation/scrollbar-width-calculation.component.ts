import {AfterViewInit, Component, ElementRef, inject, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppLayoutActions} from '../../../state/app/actions/app-layout.actions';

/**
 * This component is used to calculate the width of the scrollbar as it is highly browser/device dependent.
 * It creates a small fixed div with an always-on scrollbar and then measures the difference between the whole div and the space left after the scrollbars.
 */
@Component({
  selector: 'scrollbar-width-calculation',
  templateUrl: './scrollbar-width-calculation.component.html',
  styleUrls: ['./scrollbar-width-calculation.component.scss'],
})
export class ScrollbarWidthCalculationComponent implements AfterViewInit {
  private readonly store = inject(Store);

  private readonly containerRef = viewChild.required<ElementRef>('container');

  public ngAfterViewInit() {
    const container = this.containerRef().nativeElement;
    const scrollbarWidth = container.offsetWidth - container.clientWidth;
    this.store.dispatch(AppLayoutActions.setScrollbarWidth({scrollbarWidth: scrollbarWidth}));
  }
}
