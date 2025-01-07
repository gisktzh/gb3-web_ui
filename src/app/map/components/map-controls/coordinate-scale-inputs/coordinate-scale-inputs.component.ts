import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectCenter, selectRotation, selectScale} from '../../../../state/map/reducers/map-config.reducer';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {ConfigService} from '../../../../shared/services/config.service';
import {CoordinateParserService} from '../../../services/coordinate-parser.service';
import {NumberUtils} from '../../../../shared/utils/number.utils';
import {Coordinate} from '../../../../shared/interfaces/coordinate.interface';

/**
 * Note that for scale and mapCenter, we have two properties - one mimicks the state and one mimicks the input. The input value is used in
 * ngModel to ensure we get an updated value even if it is the same. This might happen if, for example, the current scale is "10000" and a
 * user then pasted "10'000": This will be changed to "10000" internally (correctly so) and does not dispatch a state change. However, this
 * needs to be reflected in the DOM as well, which does not happen since change detection does not pick up an identical value or cannot
 * change the field's value if it is still focused.
 *
 * Also note: We cannot use a number field for the scale input because it is a hard requirement to be able to pass e.g. "10'000", which does
 * not work natively in Firefox. See https://jira-geo.zh.ch/browse/GB3-1120 for more info.
 */
@Component({
  selector: 'coordinate-scale-inputs',
  templateUrl: './coordinate-scale-inputs.component.html',
  styleUrls: ['./coordinate-scale-inputs.component.scss'],
  standalone: false,
})
export class CoordinateScaleInputsComponent implements OnInit, OnDestroy {
  public scale: number = 0;
  public scaleInput: string = '';
  public mapCenter: string = '';
  public mapCenterInput: string = '';

  public rotation: number = 0;

  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly rotation$ = this.store.select(selectRotation);
  private readonly scaleState$: Observable<number> = this.store.select(selectScale);
  private readonly centerState$: Observable<Coordinate> = this.store.select(selectCenter);

  constructor(
    private readonly coordinateParserService: CoordinateParserService,
    private readonly store: Store,
    private readonly configService: ConfigService,
  ) {}

  public setScale(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    const newScale = NumberUtils.parseNumberFromMixedString(input);

    if (newScale && newScale !== this.scale) {
      this.store.dispatch(MapConfigActions.setScale({scale: newScale}));
    } else {
      this.scaleInput = this.scale.toString();
    }
  }

  public setMapCenterAndDrawHighlight(event: Event) {
    const input = event.target as HTMLInputElement;
    const center = this.coordinateParserService.parse(input.value);

    if (center) {
      this.store.dispatch(MapConfigActions.setMapCenterAndDrawHighlight({center}));
    } else {
      input.value = this.mapCenter;
    }
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.scaleState$.pipe(tap((value) => this.updateScaleValues(value))).subscribe());
    this.subscriptions.add(this.rotation$.pipe(tap((value) => (this.rotation = value))).subscribe());
    this.subscriptions.add(
      this.centerState$
        .pipe(
          tap(({x, y}) => {
            this.updateMapCenterValues(x, y);
          }),
        )
        .subscribe(),
    );
  }

  private updateMapCenterValues(x: number, y: number) {
    this.mapCenter = `${NumberUtils.roundToDecimals(x)} / ${NumberUtils.roundToDecimals(y)}`;
    this.mapCenterInput = this.mapCenter;
  }

  private updateScaleValues(value: number) {
    this.scale = NumberUtils.roundToDecimals(value);
    this.scaleInput = this.scale.toString();
  }
}
