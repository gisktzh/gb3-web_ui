import {Gb3ApiService} from './gb3-api.service';
import {Inject, Injectable} from '@angular/core';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {map} from 'rxjs/operators';
import {ExportFormat} from '../../../types/export-format.type';
import {saveAs} from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class Gb3ExportService extends Gb3ApiService {
  protected readonly endpoint = 'export';

  constructor(@Inject(HttpClient) http: HttpClient, @Inject(ConfigService) configService: ConfigService) {
    super(http, configService);
  }

  public exportDrawing(exportFormat: ExportFormat, drawings: Gb3VectorLayer) {
    return this.post<Gb3VectorLayer, Blob>(this.getFullEndpointUrlForExportFormat(exportFormat), drawings, undefined, true).pipe(
      map((blob) => {
        saveAs(blob, 'geojson.json');
        return blob;
      }),
    );
  }

  private getFullEndpointUrlForExportFormat(exportFormat: string): string {
    return `${this.getFullEndpointUrl()}/${exportFormat}`;
  }
}
