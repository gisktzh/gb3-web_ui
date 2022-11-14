import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';
import {Store} from '@ngrx/store';
import {selectMapConfigurationState} from '../../../core/state/map/reducers/map-configuration.reducer';
import {Subscription} from 'rxjs';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;
  private mapConfiguration$ = this.store.select(selectMapConfigurationState);
  private mapConfigurationSubscription = new Subscription();
  public centerCoordinates: number[] = [];
  public scale: number = 0;

  constructor(private readonly mapService: MapService, private store: Store) {}

  public ngOnInit() {
    this.mapService.init();
    this.mapConfigurationSubscription.add(
      this.mapConfiguration$.subscribe(({center, scale}) => {
        this.centerCoordinates = [center.x, center.y];
        this.scale = scale;
      })
    );
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }

  public ngOnDestroy(): void {
    this.mapConfigurationSubscription.unsubscribe();
  }
}
