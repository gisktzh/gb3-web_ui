import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../../../state/map/reducers/legend.reducer';
import {LegendActions} from '../../../state/map/actions/legend.actions';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {selectLegendItemsForDisplay} from '../../../state/map/selectors/legend-result-display.selector';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';

@Component({
  selector: 'legend-overlay',
  templateUrl: './legend-overlay.component.html',
  styleUrls: ['./legend-overlay.component.scss'],
})
export class LegendOverlayComponent implements OnInit, OnDestroy {
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;
  @Output() public readonly printLegendEvent = new EventEmitter<void>();

  public isVisible = false;
  public legendItems: LegendDisplay[] = [];
  public loadingState: LoadingState = 'undefined';
  public screenMode: ScreenMode = 'mobile';

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly legendItems$ = this.store.select(selectLegendItemsForDisplay);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(LegendActions.hideLegend());
  }

  public print() {
    this.printLegendEvent.emit();
  }

  public trackById(index: number, item: LegendDisplay): string {
    return item.id;
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap((value) => {
            this.loadingState = value;
            this.updateVisibility(value);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.legendItems$
        .pipe(
          tap((value) => {
            this.legendItems = value;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
  }

  private updateVisibility(loadingState: LoadingState) {
    this.isVisible = loadingState !== 'undefined';
  }
}
