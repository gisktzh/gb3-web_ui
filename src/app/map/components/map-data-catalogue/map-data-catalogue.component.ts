import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectFilterString, selectLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../../state/map/actions/layer-catalog.actions';
import {debounceTime, distinctUntilChanged, fromEvent, Observable, Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Map, MapLayer, Topic} from '../../../shared/interfaces/topic.interface';
import {selectFilteredLayerCatalog} from '../../../state/map/selectors/filtered-layer-catalog.selector';
import {map} from 'rxjs/operators';
import {selectMaps} from '../../../state/map/selectors/maps.selector';

@Component({
  selector: 'map-data-catalogue',
  templateUrl: './map-data-catalogue.component.html',
  styleUrls: ['./map-data-catalogue.component.scss']
})
export class MapDataCatalogueComponent implements OnInit, OnDestroy, AfterViewInit {
  public topics: Topic[] = [];
  public loadingState: LoadingState = 'undefined';
  public filterString: string = '';

  private originalMaps: Map[] = [];
  private readonly filterString$ = this.store.select(selectFilterString);
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly topics$ = this.store.select(selectFilteredLayerCatalog);
  private readonly originalMaps$ = this.store.select(selectMaps);
  private readonly subscriptions = new Subscription();
  @ViewChild('filterInput') private readonly input!: ElementRef;

  constructor(private readonly store: Store) {}

  public async ngOnInit() {
    this.initSubscriptions();
    await this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(this.filterInputHandler().subscribe());
  }

  /**
   * Adds an activeMap to the map. If a filter is active, takes the original map from the store to avoid adding a filtered, incomplete map.
   * @param activeMap
   */
  public addActiveMap(activeMap: Map) {
    if (this.filterString !== '') {
      const originalActiveMap = this.originalMaps.find((originalMap) => originalMap.id === activeMap.id);
      if (!originalActiveMap) {
        throw new Error('Map cannot be found.'); //todo: error handling (although this should never happen here)
      }
      activeMap = originalActiveMap;
    }

    this.addActiveItem(new ActiveMapItem(activeMap));
  }

  public addActiveLayer(activeMap: Map, layer: MapLayer) {
    this.addActiveItem(new ActiveMapItem(activeMap, layer));
  }

  public trackByTopicTitle(index: number, item: Topic) {
    return item.title;
  }

  public trackByMapId(index: number, item: Map) {
    return item.id;
  }

  private filterInputHandler(): Observable<string> {
    return fromEvent<KeyboardEvent>(this.input.nativeElement, 'keyup').pipe(
      debounceTime(300),
      map((event) => (<HTMLInputElement>event.target).value),
      distinctUntilChanged(),
      tap((event) => this.filterCatalog(event))
    );
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.topics$
        .pipe(
          tap((topics) => {
            this.topics = topics;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap(async (value) => {
            this.loadingState = value;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.filterString$
        .pipe(
          tap(async (value) => {
            this.filterString = value;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.originalMaps$
        .pipe(
          tap(async (value) => {
            this.originalMaps = value;
          })
        )
        .subscribe()
    );
  }

  private filterCatalog(filterString: string) {
    this.store.dispatch(LayerCatalogActions.setFilterString({filterString}));
  }
}
