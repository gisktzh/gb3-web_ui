import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {MatExpansionPanel} from '@angular/material/expansion';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {DataCataloguePage} from '../../../../shared/enums/data-catalogue-page.enum';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItem} from '../../../models/active-map-item.model';

@Component({
  selector: 'active-map-item-header',
  templateUrl: './active-map-item-header.component.html',
  styleUrls: ['./active-map-item-header.component.scss'],
  standalone: false,
})
export class ActiveMapItemHeaderComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public activeMapItemExpansionPanel!: MatExpansionPanel;
  @Input() public isDragAndDropDisabled: boolean = false;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  protected readonly mainPageEnum = MainPage;
  protected readonly dataCataloguePageEnum = DataCataloguePage;

  public ngOnInit(): void {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public toggleMapItemVisibility(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setVisibility({visible: !activeMapItem.visible, activeMapItem}));
  }

  public removeActiveMapItem(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.removeActiveMapItem({activeMapItem}));
  }
}
