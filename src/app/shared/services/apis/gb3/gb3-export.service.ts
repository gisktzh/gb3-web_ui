import {Gb3ApiService} from './gb3-api.service';
import {Inject, Injectable} from '@angular/core';
import {ExportGeojsonCreateData} from '../../../models/gb3-api-generated.interfaces';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {selectUserDrawingsVectorLayers} from '../../../../state/map/selectors/user-drawings-vector-layers.selector';
import {Store} from '@ngrx/store';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {map} from 'rxjs/operators';
import {ExportFormat} from '../../../types/export-format.type';

@Injectable({
  providedIn: 'root',
})
export class Gb3ExportService extends Gb3ApiService {
  protected readonly endpoint = 'export';
  private readonly userDrawingsVectorLayers$ = this.store.select(selectUserDrawingsVectorLayers);

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(ConfigService) configService: ConfigService,
    private readonly store: Store,
  ) {
    super(http, configService);
  }

  public exportDrawing(exportFormat: ExportFormat, drawings: Gb3VectorLayer) {
    return this.post<Gb3VectorLayer, ExportGeojsonCreateData>(this.getFullEndpointUrlForExportFormat(exportFormat), drawings).pipe(
      map((response) => {
        return response;
      }),
    );
  }

  private getFullEndpointUrlForExportFormat(exportFormat: string): string {
    return `${this.getFullEndpointUrl()}/${exportFormat}`;
  }
}
