import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLayerSelections} from '../../../../../state/map/reducers/map-import.reducer';
import {ExternalLayerSelection} from '../../../../../shared/interfaces/external-layer-selection.interface';
import {ExternalLayerId} from '../../../../../shared/types/external-layer-id.type';
import {
  selectAreAllLayersSelected,
  selectAreSomeButNotAllLayersSelected,
} from '../../../../../state/map/selectors/map-import-layer-selection.selector';

@Component({
  selector: 'map-import-layer-list',
  standalone: true,
  imports: [NgForOf, NgIf, MatCheckboxModule],
  templateUrl: './map-import-layer-list.component.html',
  styleUrl: './map-import-layer-list.component.scss',
})
export class MapImportLayerListComponent implements OnInit, OnDestroy {
  public layerSelections?: ExternalLayerSelection[];
  public areAllLayersSelected = false;
  public areSomeButNotAllLayersSelected = false;

  private readonly layerSelections$ = this.store.select(selectLayerSelections);
  private readonly areAllLayersSelected$ = this.store.select(selectAreAllLayersSelected);
  private readonly areSomeButNotAllLayersSelected$ = this.store.select(selectAreSomeButNotAllLayersSelected);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public toggleSelectAllLayers(isSelected: boolean) {
    this.store.dispatch(MapImportActions.selectAllLayers({isSelected}));
  }

  public toggleSelection(layerId: ExternalLayerId) {
    this.store.dispatch(MapImportActions.toggleLayerSelection({layerId}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.layerSelections$.pipe(tap((layerSelections) => (this.layerSelections = layerSelections))).subscribe());
    this.subscriptions.add(
      this.areAllLayersSelected$.pipe(tap((areAllLayersSelected) => (this.areAllLayersSelected = areAllLayersSelected))).subscribe(),
    );
    this.subscriptions.add(
      this.areSomeButNotAllLayersSelected$
        .pipe(tap((areSomeButNotAllLayersSelected) => (this.areSomeButNotAllLayersSelected = areSomeButNotAllLayersSelected)))
        .subscribe(),
    );
  }
}
