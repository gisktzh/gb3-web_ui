import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {LegendDisplay} from 'src/app/shared/interfaces/legend.interface';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {selectLoadingState} from 'src/app/state/map/reducers/legend.reducer';
import {selectLegendItemsForDisplay} from 'src/app/state/map/selectors/legend-result-display.selector';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  standalone: false,
})
export class LegendComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public showInteractiveElements: boolean = true;

  public legendItems: LegendDisplay[] = [];
  public loadingState: LoadingState = undefined;

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly legendItems$ = this.store.select(selectLegendItemsForDisplay);
  private readonly subscriptions = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public trackById(index: number, item: LegendDisplay): string {
    return item.id;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.legendItems$.pipe(tap((value) => (this.legendItems = value))).subscribe());
  }
}
