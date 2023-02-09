import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectActiveBasemapId} from '../../../../state/map/reducers/map-config.reducer';
import {Basemap} from '../../../../shared/interfaces/background-map.interface';
import {MapConfigActions} from '../../../../state/map/actions/map-config.actions';
import {BasemapConfigService} from '../../../services/basemap-config.service';
import {DocumentService} from '../../../../shared/services/document.service';

@Component({
  selector: 'basemap-selector',
  templateUrl: './basemap-selector.component.html',
  styleUrls: ['./basemap-selector.component.scss']
})
export class BasemapSelectorComponent implements OnInit, OnDestroy {
  public activeBasemapId: string = '';
  public isSelectionOpen: boolean = false;
  public availableBasemaps: Basemap[] = [];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);

  constructor(
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly documentService: DocumentService,
    private readonly elementRef: ElementRef
  ) {
    this.availableBasemaps = this.basemapConfigService.availableBasemaps;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleSelection() {
    this.isSelectionOpen = !this.isSelectionOpen;
  }

  public switchBasemap(toId: string) {
    this.store.dispatch(MapConfigActions.setBasemap({activeBasemapId: toId}));
    this.toggleSelection();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          tap((activeBasemapId) => {
            this.activeBasemapId = activeBasemapId;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.documentService.documentClicked$
        .pipe(
          tap((event: PointerEvent) => {
            if (!this.elementRef.nativeElement.contains(event.target)) {
              this.isSelectionOpen = false;
            }
          })
        )
        .subscribe()
    );
  }
}
