import {Component, computed, effect, ErrorHandler, inject, signal} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {firstValueFrom, Observable} from 'rxjs';
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
import {toSignal} from '@angular/core/rxjs-interop';

type DetailMetadata = ProductMetadata | MapMetadata | ServiceMetadata | DatasetMetadata;

@Component({
  template: '',
})
export abstract class AbstractBaseDetailComponent<T extends DetailMetadata> {
  protected readonly baseDetailMetaData = signal<T | undefined>(undefined);
  public readonly baseMetadataInformation = computed<BaseMetadataInformation | undefined>(() => {
    const baseDetailMetaData = this.baseDetailMetaData();
    return baseDetailMetaData ? this.extractBaseMetadataInformation(baseDetailMetaData) : undefined;
  });
  public readonly informationElements = computed<DataDisplayElement[]>(() => {
    const baseDetailMetaData = this.baseDetailMetaData();
    return baseDetailMetaData ? this.extractInformationElements(baseDetailMetaData) : [];
  });

  private readonly store: Store = inject(Store);
  public readonly loadingState = signal<LoadingState>('loading');
  public readonly apiBaseUrl: string;
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  protected readonly gb3MetadataService: Gb3MetadataService = inject(Gb3MetadataService);
  protected readonly mainPageEnum = MainPage;
  protected readonly dataCataloguePageEnum = DataCataloguePage;
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly router: Router = inject(Router);
  private readonly errorHandler: ErrorHandler = inject(ErrorHandler);

  protected readonly routeParamMap = toSignal(this.route.paramMap, {initialValue: this.route.snapshot.paramMap});

  protected readonly resourceId = computed(() => {
    const id = this.routeParamMap().get(RouteParamConstants.RESOURCE_IDENTIFIER);

    if (!id) {
      throw new MetadataCouldNotBeLoaded();
    }

    return id;
  });

  constructor() {
    this.apiBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
    effect(async () => {
      const id = this.resourceId();

      this.loadingState.set('loading');

      try {
        const metadata = await firstValueFrom(this.loadMetadata(id));
        this.handleMetadata(metadata);
        this.loadingState.set('loaded');
      } catch (err: unknown) {
        this.loadingState.set('error');

        if (err instanceof HttpErrorResponse && err.status === 404) {
          const notFoundError = new MetadataNotFound(err);
          this.errorHandler.handleError(notFoundError);
          this.router.navigate([MainPage.NotFound], {skipLocationChange: true});

          return;
        }

        throw new MetadataCouldNotBeLoaded(err);
      }
    });
  }

  /**
   * Handles the metadata object from the API and extracts all necessary information
   */
  protected handleMetadata(result: T) {
    this.baseDetailMetaData.set(result);
  }

  /**
   * Loads the metadata from the API
   * @param id The ID of the desired metadata.
   */
  protected abstract loadMetadata(id: string): Observable<T>;

  /**
   * Extracts the BaseMetadataInformation from the given dataset metadata.
   */
  protected abstract extractBaseMetadataInformation(datasetMetadata: T): BaseMetadataInformation;

  /**
   * Extracts information elements from the given dataset metadata.
   */
  protected abstract extractInformationElements(datasetMetadata: T): DataDisplayElement[];
}
