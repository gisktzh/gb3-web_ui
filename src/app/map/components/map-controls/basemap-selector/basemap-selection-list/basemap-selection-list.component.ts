import {Component, EventEmitter, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Basemap} from '../../../../../shared/interfaces/basemap.interface';
import {MapConfigActions} from '../../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../../services/basemap-config.service';

@Component({
  selector: 'basemap-selection-list',
  templateUrl: './basemap-selection-list.component.html',
  styleUrls: ['./basemap-selection-list.component.scss'],
  standalone: false,
})
export class BasemapSelectionListComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly basemapConfigService = inject(BasemapConfigService);

  @Output() public readonly basemapChangedEvent = new EventEmitter();

  public activeBasemap?: Basemap;
  public availableBasemaps: Basemap[] = [];
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor() {
    this.availableBasemaps = this.basemapConfigService.availableBasemaps;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigActions.setBasemap({activeBasemapId: toId}));
    this.basemapChangedEvent.emit();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          tap((activeBasemapId) => {
            this.activeBasemap = this.availableBasemaps.find((basemap) => basemap.id === activeBasemapId);
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
