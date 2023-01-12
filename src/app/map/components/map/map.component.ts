import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EsriMapService} from '../../services/esri-map.service';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [FeatureHighlightingService]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;

  constructor(private readonly mapService: EsriMapService, private readonly featureHighlightingService: FeatureHighlightingService) {}

  public ngOnInit() {
    this.mapService.init();
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }
}
