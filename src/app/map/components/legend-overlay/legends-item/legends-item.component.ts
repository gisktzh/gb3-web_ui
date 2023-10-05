import {Component, OnDestroy, OnInit, Input} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {LegendDisplay} from 'src/app/shared/interfaces/legend.interface';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {selectLegendItemsForDisplay} from 'src/app/state/map/selectors/legend-result-display.selector';
import {selectLoadingState} from 'src/app/state/map/reducers/legend.reducer';

@Component({
  selector: 'legends-item',
  templateUrl: './legends-item.component.html',
  styleUrls: ['./legends-item.component.scss'],
})
export class LegendsItemComponent implements OnInit, OnDestroy {
  @Input() public showInteractiveElements: boolean = true;

  public legendItems: LegendDisplay[] = [];
  public loadingState: LoadingState = undefined;

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly legendItems$ = this.store.select(selectLegendItemsForDisplay);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store) {}

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
