import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {BottomSheetHeight} from 'src/app/shared/types/bottom-sheet-height.type';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectIsFiltering} from 'src/app/state/map/reducers/layer-catalog.reducer';
import {selectMapAttributeFiltersItem} from 'src/app/state/map/selectors/map-attribute-filters-item.selector';

@Component({
  selector: 'bottom-sheet-item',
  templateUrl: './bottom-sheet-item.component.html',
  styleUrls: ['./bottom-sheet-item.component.scss'],
})
export class BottomSheetItemComponent implements OnInit, OnDestroy {
  @Input() public overlayTitle?: string = '';
  @Input() public usePrimaryColor: boolean = false;
  @Input() public bottomSheetHeight: BottomSheetHeight = 'small';
  @Input() public showHeader: boolean = true;
  public isFiltering: boolean = false;
  public mapAttributeFiltersItemTitle: string | undefined;

  private readonly isFiltering$ = this.store.select(selectIsFiltering);
  private readonly mapAttributeFiltersItem$ = this.store.select(selectMapAttributeFiltersItem);
  private readonly subscriptions: Subscription = new Subscription();

  protected resizeableStyle: StyleExpression = {};
  protected location: ResizeHandlerLocation = 'top';

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
    this.resizeableStyle = {};
  }

  protected resizeOverlay(newStyle: StyleExpression) {
    this.resizeableStyle = newStyle;
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.mapAttributeFiltersItem$
        .pipe(tap((mapAttributeFiltersItem) => (this.mapAttributeFiltersItemTitle = mapAttributeFiltersItem?.title)))
        .subscribe(),
    );
    this.subscriptions.add(this.isFiltering$.pipe(tap((isFiltering) => (this.isFiltering = isFiltering))).subscribe());
  }
}
