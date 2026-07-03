import {Component, computed, inject, input, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {BottomSheetHeight} from 'src/app/shared/types/bottom-sheet-height.type';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectFilterString} from 'src/app/state/map/reducers/layer-catalog.reducer';
import {selectMapAttributeFiltersItem} from 'src/app/state/map/selectors/map-attribute-filters-item.selector';
import {MatCard, MatCardHeader, MatCardContent} from '@angular/material/card';

import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ResizeHandlerComponent} from '../../../../shared/components/resize-handler/resize-handler.component';
import {CdkScrollable} from '@angular/cdk/scrolling';

@Component({
  selector: 'bottom-sheet-item',
  templateUrl: './bottom-sheet-item.component.html',
  styleUrls: ['./bottom-sheet-item.component.scss'],
  imports: [MatCard, MatCardHeader, MatIconButton, MatIcon, MatCardContent, CdkScrollable, ResizeHandlerComponent],
})
export class BottomSheetItemComponent {
  private readonly store = inject(Store);

  public readonly overlayTitle = input('');
  public readonly usePrimaryColor = input(false);
  public readonly bottomSheetHeight = input<BottomSheetHeight>('small');
  public readonly showHeader = input(true);
  public readonly filterString = this.store.selectSignal(selectFilterString);
  public readonly mapAttributeFiltersItem = this.store.selectSignal(selectMapAttributeFiltersItem);
  public readonly mapAttributeFiltersItemTitle = computed(() => this.mapAttributeFiltersItem()?.title);
  protected readonly resizeableStyle = signal<StyleExpression>({});

  public close() {
    this.store.dispatch(MapUiActions.hideBottomSheet());
    this.resizeableStyle.set({});
  }
}
