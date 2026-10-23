import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  inject,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';
import {MapViewPadding} from '../../../shared/interfaces/map-view-padding.interface';

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
  private readonly mainMapRef = viewChild.required<ElementRef>('mainMap');
  public readonly viewPadding = input<MapViewPadding | undefined>(undefined);

  constructor() {
    effect(() => this.mapService.setViewPadding(this.viewPadding()));
  }

  public ngOnInit() {
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    // Ensure the initial padding is available before assigning the container creates the MapView.
    this.mapService.setViewPadding(this.viewPadding());
    this.mapService.assignMapElement(this.mainMapRef().nativeElement);
  }

  public ngOnDestroy() {
    this.mapService.deInit();
  }
}
