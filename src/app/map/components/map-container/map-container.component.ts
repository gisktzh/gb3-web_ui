import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, inject, viewChild, ChangeDetectionStrategy} from '@angular/core';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';
import {EsriStylesLoaderService} from '../../services/esri-services/esri-styles-loader.service';

@Component({
  selector: 'map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [FeatureHighlightingService],
})
export class MapContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly featureHighlightingService = inject(FeatureHighlightingService);
  private readonly esriStylesLoaderService = inject(EsriStylesLoaderService);
  private readonly mainMapRef = viewChild.required<ElementRef>('mainMap');

  constructor() {
    // kick off the ArcGIS theme stylesheet request as early as possible; this component only
    // exists on routes that actually render a map (/maps, /embedded)
    void this.esriStylesLoaderService.ensureLoaded();
  }

  public ngOnInit() {
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef().nativeElement);
  }

  public ngOnDestroy() {
    this.mapService.deInit();
  }
}
