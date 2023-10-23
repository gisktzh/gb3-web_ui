import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigUrlService} from '../../services/map-config-url.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {PrintType} from '../../types/print.type';
import {LegendDisplay} from '../../../shared/interfaces/legend.interface';
import {FeatureInfoResultDisplay} from '../../../shared/interfaces/feature-info.interface';
import {selectLegendItemsForDisplay} from '../../../state/map/selectors/legend-result-display.selector';
import {selectFeatureInfosForDisplay} from '../../../state/map/selectors/feature-info-result-display.selector';

@Component({
  selector: 'print-overlay',
  templateUrl: './print-overlay.component.html',
  styleUrls: ['./print-overlay.component.scss'],
})
export class PrintOverlayComponent implements OnInit, OnDestroy {
  public printType: PrintType | undefined = undefined;
  public legendItems: LegendDisplay[] = [];
  public featureInfoData: FeatureInfoResultDisplay[] = [];
  private readonly legendItems$ = this.store.select(selectLegendItemsForDisplay);
  private readonly featureInfoData$ = this.store.select(selectFeatureInfosForDisplay);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly mapCon: MapConfigUrlService,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public closePrint() {
    this.mapCon.deactivatePrintMode();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.route.queryParamMap
        .pipe(
          tap((p) => {
            const printType = p.get('print');
            if (printType === 'featureInfo' && this.featureInfoData.length > 0) {
              this.printType = 'featureInfo';
            } else if (printType === 'legend' && this.legendItems.length > 0) {
              this.printType = 'legend';
            } else {
              this.printType = undefined;
            }
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
      this.featureInfoData$
        .pipe(
          tap((value) => {
            this.featureInfoData = value;
          }),
        )
        .subscribe(),
    );
  }
}
