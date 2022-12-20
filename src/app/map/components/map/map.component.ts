import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';
import {Store} from '@ngrx/store';
import {selectMapConfigurationState} from '../../../core/state/map/reducers/map-configuration.reducer';
import {Subscription, tap} from 'rxjs';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;
  private readonly mapConfiguration$ = this.store.select(selectMapConfigurationState);
  private readonly mapConfigurationSubscription = new Subscription();
  public centerCoordinates: number[] = [];
  public scale: number = 0;

  constructor(
    private readonly mapService: MapService,
    private readonly featureHighlightingService: FeatureHighlightingService,
    private store: Store
  ) {}

  public ngOnInit() {
    this.mapService.init();
    this.mapConfigurationSubscription.add(
      this.mapConfiguration$
        .pipe(
          tap(({center, scale}) => {
            this.centerCoordinates = [center.x, center.y];
            this.scale = scale;
          })
        )
        .subscribe()
    );
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }

  public ngOnDestroy(): void {
    this.mapConfigurationSubscription.unsubscribe();
  }

  public toggleLegend() {
    this.store.dispatch(LegendActions.showLegend());
  }
}
