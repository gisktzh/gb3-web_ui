import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';
import {Store} from '@ngrx/store';
import {selectMapConfigurationState} from '../../../core/state/map/reducers/map-configuration.reducer';
import {takeUntil} from 'rxjs';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {TakeUntilDestroy} from '../../../shared/directives/take-until-destroy.directive';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends TakeUntilDestroy implements OnInit, AfterViewInit {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;
  private readonly mapConfiguration$ = this.store.select(selectMapConfigurationState);
  public centerCoordinates: number[] = [];
  public scale: number = 0;

  constructor(private readonly mapService: MapService, private store: Store) {
    super();
  }

  public ngOnInit() {
    this.mapService.init();
    this.mapConfiguration$.pipe(takeUntil(this.unsubscribed$)).subscribe(({center, scale}) => {
      this.centerCoordinates = [center.x, center.y];
      this.scale = scale;
    });
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }

  public toggleLegend() {
    this.store.dispatch(LegendActions.toggleDisplay());
  }
}
