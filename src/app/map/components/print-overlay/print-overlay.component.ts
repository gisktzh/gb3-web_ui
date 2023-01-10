import {Component, OnDestroy} from '@angular/core';
import {MapConfigurationUrlService} from '../../services/map-configuration-url.service';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'print-overlay',
  templateUrl: './print-overlay.component.html',
  styleUrls: ['./print-overlay.component.scss']
})
export class PrintOverlayComponent implements OnDestroy {
  public printFeatureInfoActive: boolean = false;
  private readonly subscriptions$: Subscription = new Subscription();

  constructor(private readonly mapConfigurationUrlService: MapConfigurationUrlService, private route: ActivatedRoute) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }

  public closePrint() {
    this.mapConfigurationUrlService.deactivatePrintMode();
  }

  private initSubscriptions() {
    this.subscriptions$.add(
      this.route.queryParamMap
        .pipe(
          tap((p) => {
            this.printFeatureInfoActive = p.get('print') === 'featureInfo';
          })
        )
        .subscribe()
    );
  }
}
