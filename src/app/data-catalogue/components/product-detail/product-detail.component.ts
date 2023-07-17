import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  public data: ProductMetadata | undefined;
  public loadingState: LoadingState = 'loading';
  public readonly apiBaseUrl: string;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly gb3MetadataService: Gb3MetadataService,
    private readonly configService: ConfigService
  ) {
    this.apiBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

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
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadProductDetail(id);
          }),
          tap((results) => {
            this.data = results;
            this.loadingState = 'loaded';
          })
        )
        .subscribe()
    );
  }
}
