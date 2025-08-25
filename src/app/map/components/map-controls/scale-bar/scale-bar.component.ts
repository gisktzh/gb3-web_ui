import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {delay, filter, Subscription, tap} from 'rxjs';
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
  private readonly store = inject(Store);

  protected scaleBarLabel: string | undefined;
  @ViewChild('scaleBar', {static: true}) private scaleBar!: ElementRef;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly scaleBarConfig$ = this.store.select(selectScaleBarConfig);

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.scaleBarConfig$
        .pipe(
          delay(0), // delayed to a separate task run, to avoid NgExpressionChangedAfterChecked
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
