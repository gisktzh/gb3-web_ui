import {Component, ErrorHandler, inject, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {catchError, Observable, of, Subscription, switchMap, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {DatasetMetadata, MapMetadata, ProductMetadata, ServiceMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {HttpErrorResponse} from '@angular/common/http';
import {MetadataCouldNotBeLoaded, MetadataNotFound} from '../../../shared/errors/data-catalogue.errors';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../../shared/types/screen-size.type';

type DetailMetadata = ProductMetadata | MapMetadata | ServiceMetadata | DatasetMetadata;

@Component({
  template: '',
  standalone: false,
})
export abstract class AbstractBaseDetailComponent<T extends DetailMetadata> implements OnInit, OnDestroy {
  public abstract baseMetadataInformation?: BaseMetadataInformation;
  public abstract informationElements: DataDisplayElement[];
  public loadingState: LoadingState = 'loading';
  public readonly apiBaseUrl: string;
  public screenMode: ScreenMode = 'regular';
  protected readonly gb3MetadataService: Gb3MetadataService = inject(Gb3MetadataService);
  protected readonly mainPageEnum = MainPage;
  protected readonly dataCataloguePageEnum = DataCataloguePage;
  protected readonly subscriptions: Subscription = new Subscription();
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly router: Router = inject(Router);
  private readonly errorHandler: ErrorHandler = inject(ErrorHandler);
  private readonly store: Store = inject(Store);
  protected readonly screenMode$ = this.store.select(selectScreenMode);

  constructor() {
    this.apiBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected initSubscriptions() {
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = params.get(RouteParamConstants.RESOURCE_IDENTIFIER);
            if (!id) {
              // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
              throw new MetadataCouldNotBeLoaded();
            }
            return this.loadMetadata(id).pipe(
              catchError((err: unknown) => {
                this.loadingState = 'error';

                if (err instanceof HttpErrorResponse && err.status === 404) {
                  throw new MetadataNotFound(err);
                } else {
                  throw new MetadataCouldNotBeLoaded(err);
                }
              }),
            );
          }),
          tap((metadata: T) => {
            this.handleMetadata(metadata);
            this.loadingState = 'loaded';
          }),
          catchError((error: unknown) => {
            if (error instanceof MetadataNotFound) {
              this.errorHandler.handleError(error); // make sure we log the error before redirect
              return of(this.router.navigate([MainPage.NotFound], {skipLocationChange: true}));
            }

            throw error;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  /**
   * Loads the metadata from the API
   * @param id The ID of the desired metadata.
   */
  protected abstract loadMetadata(id: string): Observable<T>;

  /**
   * Handles the metadata object from the API and extracts all necessary information
   */
  protected abstract handleMetadata(result: T): void;
}
