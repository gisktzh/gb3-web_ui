import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../interfaces/map.service';
import {MapUiState} from '../../../state/map/states/map-ui.state';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss'],
})
export class MapControlsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scaleBarContainer', {static: true}) private scaleBarContainerRef!: ElementRef;

  public mapUiState?: MapUiState;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly mapUiState$ = this.store.select(selectMapUiState);

  constructor(
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.mapService.assignScaleBarElement(this.scaleBarContainerRef.nativeElement);
  }

  private initSubscriptions() {
    this.subscriptions.add(this.mapUiState$.pipe(tap((value) => (this.mapUiState = value))).subscribe());
  }
}
