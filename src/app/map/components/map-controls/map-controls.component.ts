import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MAP_SERVICE} from '../../../app.module';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';
import {MapUiState} from '../../../state/map/states/map-ui.state';
import {MapService} from '../../interfaces/map.service';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss'],
  standalone: false,
})
export class MapControlsComponent implements OnInit, OnDestroy {
  @ViewChild('scaleBarContainer', {static: true}) private scaleBarContainerRef!: ElementRef;

  public screenMode: ScreenMode = 'regular';
  public mapUiState?: MapUiState;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly screenMode$ = this.store.select(selectScreenMode);

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

  private initSubscriptions() {
    this.subscriptions.add(this.mapUiState$.pipe(tap((value) => (this.mapUiState = value))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
