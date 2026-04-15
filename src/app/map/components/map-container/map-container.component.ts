import {AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild, inject} from '@angular/core';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';

@Component({
  selector: 'map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
  providers: [FeatureHighlightingService],
})
export class MapContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly featureHighlightingService = inject(FeatureHighlightingService);

  @ViewChild('mainMap', {static: true}) private mainMapRef!: ElementRef;

  public ngOnInit() {
    this.mapService.init();
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }

  public ngOnDestroy() {
    this.mapService.unassignMapElement();
  }
}
