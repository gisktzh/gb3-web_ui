import {Injectable, OnDestroy, inject} from '@angular/core';
import {filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MapDrawingService} from './map-drawing.service';
import {selectFeatureHighlightToDraw} from '../../state/map/selectors/query-graphics.selector';

@Injectable()
export class FeatureHighlightingService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);

  private subscription?: Subscription;

  public init() {
    this.subscription?.unsubscribe();
    this.subscription = this.store
      .select(selectFeatureHighlightToDraw)
      .pipe(
        filter(({ready}) => ready),
        tap(({geometry}) => {
          this.mapDrawingService.clearFeatureInfoHighlight();
          if (geometry) {
            this.mapDrawingService.drawFeatureInfoHighlight(geometry);
          }
        }),
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
