import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigUrlService} from '../../services/map-config-url.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLegendItems} from '../../../state/map/reducers/legend.reducer';
import {PrintType} from '../../../shared/types/print-type';
import {selectData} from '../../../state/map/reducers/feature-info.reducer';
import {Legend} from '../../../shared/interfaces/legend.interface';
import {FeatureInfoResult} from '../../../shared/interfaces/feature-info.interface';

@Component({
  selector: 'print-overlay',
  templateUrl: './print-overlay.component.html',
  styleUrls: ['./print-overlay.component.scss']
})
export class PrintOverlayComponent implements OnInit, OnDestroy {
  public printType: PrintType | undefined = undefined;
  public legendItems: Legend[] = [];
  public featureInfoData: FeatureInfoResult[] = [];
  private readonly legendItems$ = this.store.select(selectLegendItems);
  private readonly featureInfoData$ = this.store.select(selectData);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly mapCon: MapConfigUrlService, private readonly store: Store, private readonly route: ActivatedRoute) {}

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
              this.closePrint();
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
    this.subscriptions.add(
      this.featureInfoData$
        .pipe(
          tap(async (value) => {
            this.featureInfoData = value;
          })
        )
        .subscribe()
    );
  }
}
