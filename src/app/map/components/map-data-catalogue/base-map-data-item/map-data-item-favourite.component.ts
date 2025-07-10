import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';

const FAVOURITE_ERROR_TOOLTIP =
  'Der Favorit kann nicht angezeigt werden. Dies kann verschiedene Gründe haben - z.B. existiert eine (' +
  'oder mehrere) Karten innerhalb des Favorits nicht mehr.';

@Component({
  selector: 'map-data-item-favourite',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
  standalone: false,
})
export class MapDataItemFavouriteComponent extends BaseMapDataItemComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public override loadingState: LoadingState;
  @Input() public override invalid?: boolean;

  @Output() public override readonly deleteEvent = new EventEmitter<void>();

  public override showExpandButton = false;
  public override showDeleteButton = true;
  public override errorTooltip: string = FAVOURITE_ERROR_TOOLTIP;
  public override isAddItemDisabled: boolean = false;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeTool$ = this.store.select(selectActiveTool);

  public ngOnInit() {
    this.subscriptions.add(this.activeTool$.pipe(tap((activeTool) => (this.isAddItemDisabled = !!activeTool))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
