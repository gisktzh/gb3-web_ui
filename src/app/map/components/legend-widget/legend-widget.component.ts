import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLegendItems, selectVisible} from '../../../core/state/map/reducers/legend.reducer';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Legend} from '../../../shared/services/apis/gb3/gb3-api.interfaces';
import {LayersConfig} from '../../../../assets/layers.config';

@Component({
  selector: 'legend-widget',
  templateUrl: './legend-widget.component.html',
  styleUrls: ['./legend-widget.component.scss']
})
export class LegendWidgetComponent implements OnInit, OnDestroy {
  public isVisible = false;
  public legendItems: Legend[] = [];
  private readonly visibility$ = this.store.select(selectVisible);
  private readonly legendItems$ = this.store.select(selectLegendItems);
  private readonly subscriptions = new Subscription();

  constructor(private readonly store: Store, private readonly gb3TopicsService: Gb3TopicsService) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.visibility$
        .pipe(
          tap(async (value) => {
            this.isVisible = value;
            if (value) {
              await this.loadLegends();
            }
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.legendItems$
        .pipe(
          tap(async (value) => {
            this.legendItems = value;
          })
        )
        .subscribe()
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.store.dispatch(LegendActions.toggleDisplay());
    this.store.dispatch(LegendActions.clearLegendContent()); // todo: remove once dependent on layer state
  }

  private async loadLegends() {
    // todo: once implemented, load legend when a layer is added to the store
    await Promise.all(
      LayersConfig.map(async (config) => {
        const legend = await this.gb3TopicsService.loadLegend(config.queryLayerName);
        this.store.dispatch(LegendActions.addLegendContent(legend));
      })
    );
  }
}
