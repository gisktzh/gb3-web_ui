import {Component, ElementRef, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectMapUiState} from '../../../state/map/reducers/map-ui.reducer';
import {MapUiState} from '../../../state/map/states/map-ui.state';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';

@Component({
  selector: 'map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss'],
  standalone: false,
})
export class MapControlsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  @ViewChild('scaleBarContainer', {static: true}) private scaleBarContainerRef!: ElementRef;

  public screenMode: ScreenMode = 'regular';
  public mapUiState?: MapUiState;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly screenMode$ = this.store.select(selectScreenMode);

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
