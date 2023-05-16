import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectCenter, selectScale} from '../../../../state/map/reducers/map-config.reducer';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {ConfigService} from '../../../../shared/services/config.service';
import {CoordinateParserService} from '../../../services/coordinate-parser.service';

@Component({
  selector: 'coordinate-scale-inputs',
  templateUrl: './coordinate-scale-inputs.component.html',
  styleUrls: ['./coordinate-scale-inputs.component.scss']
})
export class CoordinateScaleInputsComponent implements OnInit, OnDestroy {
  public scale: number = 0;
  public mapCenter: string = '';
  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly scaleState$: Observable<number> = this.store.select(selectScale);
  private readonly centerState$: Observable<{x: number; y: number}> = this.store.select(selectCenter);

  constructor(
    private readonly coordinateParserService: CoordinateParserService,
    private readonly store: Store,
    private readonly configService: ConfigService
  ) {}

  public setScale(event: Event) {
    const newScale = (event.target as HTMLInputElement).valueAsNumber;
    this.store.dispatch(MapConfigActions.setScale({scale: newScale}));
  }

  public setMapCenter(event: Event) {
    const input = event.target as HTMLInputElement;
    const center = this.coordinateParserService.parse(input.value);

    if (center) {
      this.store.dispatch(MapConfigActions.setMapCenter({center}));
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
    this.subscriptions.add(this.scaleState$.pipe(tap((value) => (this.scale = Math.round(value)))).subscribe());

    this.subscriptions.add(
      this.centerState$
        .pipe(
          tap(({x, y}) => {
            this.mapCenter = `${Math.round(x)} / ${Math.round(y)}`;
          })
        )
        .subscribe()
    );
  }
}
