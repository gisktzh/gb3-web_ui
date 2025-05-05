import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLayerSelections} from '../../../../../state/map/reducers/map-import.reducer';
import {ExternalLayerSelection} from '../../../../../shared/interfaces/external-layer-selection.interface';
import {ExternalLayerId} from '../../../../../shared/types/external-layer-id.type';

@Component({
  selector: 'map-import-layer-list',
  imports: [MatCheckboxModule],
  templateUrl: './map-import-layer-list.component.html',
  styleUrl: './map-import-layer-list.component.scss',
})
export class MapImportLayerListComponent implements OnInit, OnDestroy {
  public layerSelections?: ExternalLayerSelection[];

  private readonly layerSelections$ = this.store.select(selectLayerSelections);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public toggleSelection(layerId: ExternalLayerId) {
    this.store.dispatch(MapImportActions.toggleLayerSelection({layerId}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.layerSelections$.pipe(tap((layerSelections) => (this.layerSelections = layerSelections))).subscribe());
  }
}
