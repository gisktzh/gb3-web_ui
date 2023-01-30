import {Component, OnDestroy, OnInit} from '@angular/core';
import {GeoLionGeodatenMetaInterface} from '../../../shared/interfaces/geolion-geodaten-meta.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {GeoLionService} from '../../../shared/services/apis/geolion/geo-lion.service';

@Component({
  selector: 'geo-data-detail',
  templateUrl: './geo-data-detail.component.html',
  styleUrls: ['./geo-data-detail.component.scss']
})
export class GeoDataDetailComponent implements OnInit, OnDestroy {
  public mapDetailData: GeoLionGeodatenMetaInterface | undefined;
  public loadingState: LoadingState = 'loading';
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly route: ActivatedRoute, private readonly geoLionService: GeoLionService) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = params.get('id');
            if (!id) {
              return throwError(new Error('No id specified'));
            }
            return this.geoLionService.getGeodatenMetaData(id);
          }),
          tap((results) => {
            this.mapDetailData = results;
            this.loadingState = 'loaded';
          })
        )
        .subscribe()
    );
  }
}
