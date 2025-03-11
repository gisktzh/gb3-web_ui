import {AfterViewInit, Component, Inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.module';

@Component({
  selector: 'map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
  providers: [FeatureHighlightingService],
  standalone: false,
})
export class MapContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('mainMap', {read: ViewContainerRef, static: true}) private mainMapRef!: ViewContainerRef;

  constructor(
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly featureHighlightingService: FeatureHighlightingService,
  ) {}

  public ngOnInit() {
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef);
  }
}
