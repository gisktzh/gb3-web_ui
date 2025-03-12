import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {filter, Subscription, tap} from 'rxjs';
import {selectReferenceDistanceInMeters} from 'src/app/state/map/reducers/map-config.reducer';
import {MapConstants} from '../../../../shared/constants/map.constants';
import {NgClass} from '@angular/common';

/**
 * A scale bar component that displays a scale bar based on the reference distance in meters. Its counterpart is in the mapservice that
 * needs to calculate the reference distance in meters by a set of know pixel coordinates.
 *
 * The glue for these components is the MapConstants.MAX_SCALE_BAR_WIDTH_PX constant that defines the maximum width of the scale bar,
 * which can then be used to calculate the actual ration given the reference distance of said pixel length.
 */
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
  private referenceDistanceInMeters$ = this.store.select(selectReferenceDistanceInMeters);

  constructor(private readonly store: Store) {}

  public ngAfterViewInit() {
    // we use afterViewInit because then we can be sure that #scaleBar is available
    this.subscriptions.add(
      this.referenceDistanceInMeters$
        .pipe(
          filter((distanceInMeters): distanceInMeters is number => distanceInMeters !== undefined),
          tap((distanceInMeters) => {
            if (distanceInMeters >= 1) {
              this.updateWithRoundedDistance(distanceInMeters);
            } else {
              this.updateWithCentimeters(distanceInMeters);
            }
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Updates the scale bar to centimeters by finding the closes match and then calculating the ratio.
   */
  private updateWithCentimeters(distanceInMeters: number) {
    const breaks = [50, 20, 10, 5, 2, 1];
    const centimeters = Math.round(distanceInMeters * 100); // Convert meters to cm
    const snappedCentimeter = breaks.find((b) => centimeters >= b) || 1; // Find closest match
    const ratio = snappedCentimeter / (distanceInMeters * 100);

    this.updateScaleBarWidth(ratio);
    this.scaleBarLabel = `${snappedCentimeter} cm`;
  }

  /**
   * Updates the scale bar to meters by rounding to common scale values and calculating the correct ratio.
   * This is adapted from Leaflet's L.Control.Scale._getRoundNum method
   * (https://github.com/Leaflet/Leaflet/blob/main/src/control/Control.Scale.js#L117)
   */
  private updateWithRoundedDistance(distanceInMeters: number) {
    const pow10 = Math.pow(10, `${Math.floor(distanceInMeters)}`.length - 1);
    let d = distanceInMeters / pow10;
    d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
    const meters = pow10 * d;
    const ratio = meters / distanceInMeters;

    this.updateScaleBarWidth(ratio);
    this.scaleBarLabel = meters >= 1000 ? `${meters / 1000} km` : `${meters} m`;
  }

  private updateScaleBarWidth(ratio: number) {
    this.scaleBar.nativeElement.style.width = `${Math.round(MapConstants.MAX_SCALE_BAR_WIDTH_PX * ratio)}px`;
  }
}
