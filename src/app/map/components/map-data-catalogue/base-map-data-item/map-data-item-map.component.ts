import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';
import {MatTooltip} from '@angular/material/tooltip';
import {DelayedMouseEnterDirective} from '../../../../shared/directives/delayed-mouse-enter.directive';
import {MatIconButton} from '@angular/material/button';
import {NgClass} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {Gb2ExitButtonComponent} from '../../../../shared/components/external-link-button/gb2-exit-button.component';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MapDataItemMapLayerComponent} from '../map-data-item-map-layer/map-data-item-map-layer.component';
import {HighlightSearchQueryPipe} from '../../../../shared/pipes/highlight-search-query.pipe';
import {AppendMapConfigurationToUrlPipe} from '../../../../shared/pipes/append-map-configuration-to-url.pipe';

@Component({
  selector: 'map-data-item-map',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatTooltip,
    DelayedMouseEnterDirective,
    MatIconButton,
    NgClass,
    MatIcon,
    MatBadge,
    ShowTooltipIfTruncatedDirective,
    Gb2ExitButtonComponent,
    LoadingAndProcessBarComponent,
    MatExpansionPanelContent,
    MapDataItemMapLayerComponent,
    HighlightSearchQueryPipe,
    AppendMapConfigurationToUrlPipe,
  ],
})
export class MapDataItemMapComponent extends BaseMapDataItemComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public override layers: MapLayer[] = [];
  @Input() public override imageUrl!: string;
  @Input() public override gb2Url: string | null = null;

  @Output() public override readonly addLayerEvent = new EventEmitter<MapLayer>();

  public override loadingState: LoadingState = 'loaded';

  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    // only add subscription if the item is a gb2-only item
    if (this.gb2Url) {
      this.showExpandButton = false;
      this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
