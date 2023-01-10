import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigurationUrlService} from '../../services/map-configuration-url.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLegendItems} from '../../../core/state/map/reducers/legend.reducer';
import {Legend} from '../../../shared/models/gb3-api.interfaces';
import {PrintType} from '../../../shared/types/print-type';

@Component({
  selector: 'print-overlay',
  templateUrl: './print-overlay.component.html',
  styleUrls: ['./print-overlay.component.scss']
})
export class PrintOverlayComponent implements OnInit, OnDestroy {
  public printType: PrintType | undefined = undefined;
  public legendItems: Legend[] = [];
  private readonly legendItems$ = this.store.select(selectLegendItems);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly mapConfigurationUrlService: MapConfigurationUrlService,
    private readonly store: Store,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public closePrint() {
    this.mapConfigurationUrlService.deactivatePrintMode();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.route.queryParamMap
        .pipe(
          tap((p) => {
            const printType = p.get('print');
            if (printType === 'featureInfo') {
              this.printType = 'featureInfo';
            } else if (printType === 'legend') {
              this.printType = 'legend';
            } else {
              this.printType = undefined;
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
}
