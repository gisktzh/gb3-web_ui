import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {Basemap} from '../../../../shared/interfaces/basemap.interface';
import {DocumentService} from '../../../../shared/services/document.service';
import {selectActiveBasemapId} from '../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../services/basemap-config.service';

@Component({
  selector: 'basemap-selector',
  templateUrl: './basemap-selector.component.html',
  styleUrls: ['./basemap-selector.component.scss'],
  standalone: false,
})
export class BasemapSelectorComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly store = inject(Store);
  private readonly basemapConfigService = inject(BasemapConfigService);
  private readonly documentService = inject(DocumentService);

  @ViewChild('basemapSelector', {read: ElementRef, static: false}) private basemapSelectorRef!: ElementRef;
  @ViewChild('basemapSelectorButton', {read: ElementRef}) private basemapSelectorButtonRef!: ElementRef;

  public activeBasemap?: Basemap;
  public isSelectionOpen: boolean = false;
  public availableBasemaps: Basemap[] = [];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);

  constructor() {
    this.availableBasemaps = this.basemapConfigService.availableBasemaps;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.documentService.documentClicked$
        .pipe(
          tap((event: PointerEvent) => {
            if (!this.basemapSelectorRef.nativeElement.contains(event.target)) {
              this.isSelectionOpen = false;
            }
          }),
        )
        .subscribe(),
    );
  }

  public toggleSelectionAndFocusBasemapSelectorButton() {
    this.toggleSelection();
    this.basemapSelectorButtonRef.nativeElement.focus();
  }

  public toggleSelection() {
    this.isSelectionOpen = !this.isSelectionOpen;
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
  }
}
