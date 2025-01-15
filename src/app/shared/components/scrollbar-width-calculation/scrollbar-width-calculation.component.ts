import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
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
  standalone: false,
})
export class ScrollbarWidthCalculationComponent implements AfterViewInit {
  @ViewChild('container') private readonly containerRef!: ElementRef;

  constructor(private readonly store: Store) {}

  public ngAfterViewInit() {
    const scrollbarWidth = this.containerRef.nativeElement.offsetWidth - this.containerRef.nativeElement.clientWidth;
    this.store.dispatch(AppLayoutActions.setScrollbarWidth({scrollbarWidth: scrollbarWidth}));
  }
}
