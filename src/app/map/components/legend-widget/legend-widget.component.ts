import {Component, OnInit} from '@angular/core';
import {takeUntil, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLegendItems, selectVisible} from '../../../core/state/map/reducers/legend.reducer';
import {LegendActions} from '../../../core/state/map/actions/legend.actions';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Legend} from '../../../shared/models/gb3-api.interfaces';
import {LayersConfig} from '../../../../assets/layers.config';
import {TakeUntilDestroy} from '../../../shared/directives/take-until-destroy.directive';

@Component({
  selector: 'legend-widget',
  templateUrl: './legend-widget.component.html',
  styleUrls: ['./legend-widget.component.scss']
})
export class LegendWidgetComponent extends TakeUntilDestroy implements OnInit {
  public isVisible = false;
  public legendItems: Legend[] = [];
  private readonly visibility$ = this.store.select(selectVisible);
  private readonly legendItems$ = this.store.select(selectLegendItems);

  constructor(private readonly store: Store, private readonly gb3TopicsService: Gb3TopicsService) {
    super();
  }

  public ngOnInit() {
    this.visibility$
      .pipe(
        tap(async (value) => {
          if (value) {
            await this.loadLegends();
          }
        }),
        takeUntil(this.unsubscribed$)
      )
      .subscribe((value) => {
        this.isVisible = value;
      });

    this.legendItems$.pipe(takeUntil(this.unsubscribed$)).subscribe((value) => {
      this.legendItems = value;
    });
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
