import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {filter, Subscription, tap} from 'rxjs';
import {NgClass} from '@angular/common';
import {selectScaleBarConfig} from '../../../../state/map/selectors/scale-bar-config.selector';
import {ScaleBarConfig} from '../../../../shared/interfaces/scale-bar-config.interface';

@Component({
  selector: 'scale-bar',
  templateUrl: './scale-bar.component.html',
  styleUrls: ['./scale-bar.component.scss'],
  imports: [NgClass],
})
export class ScaleBarComponent implements AfterViewInit, OnDestroy {
  protected scaleBarLabel: string | undefined;
  @ViewChild('scaleBar', {static: true}) private scaleBar!: ElementRef;
  private readonly subscriptions: Subscription = new Subscription();
  private scaleBarConfig$ = this.store.select(selectScaleBarConfig);

  constructor(private readonly store: Store) {}

  public ngAfterViewInit() {
    // we use afterViewInit because then we can be sure that #scaleBar is available
    this.subscriptions.add(
      this.scaleBarConfig$
        .pipe(
          filter((scaleBarConfig): scaleBarConfig is ScaleBarConfig => scaleBarConfig !== undefined),
          tap(({scaleBarWidthInPx, value, unit}) => {
            this.scaleBar.nativeElement.style.width = `${scaleBarWidthInPx}px`;
            this.scaleBarLabel = `${value} ${unit}`;
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
