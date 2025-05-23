import {Gb3ApiService} from './gb3-api.service';
import {Inject, Injectable} from '@angular/core';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {map} from 'rxjs';
import {ExportFormat} from '../../../enums/export-format.enum';
import {FileDownloadService} from '../../file-download-service';
import {TIME_SERVICE} from '../../../../app.module';
import {TimeService} from 'src/app/shared/interfaces/time-service.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3ExportService extends Gb3ApiService {
  protected readonly endpoint = 'export';

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(TIME_SERVICE) timeService: TimeService,
    private readonly fileDownloadService: FileDownloadService,
  ) {
    super(http, configService, timeService);
  }

  public exportDrawing(exportFormat: ExportFormat, drawings: Gb3VectorLayer) {
    return this.post<Gb3VectorLayer, Blob>(this.getFullEndpointUrlForExportFormat(exportFormat), drawings, undefined, true).pipe(
      map((blob) => {
        this.fileDownloadService.downloadFileFromBlob(blob, `drawings.${exportFormat}`);
        return blob;
      }),
    );
  }

  private getFullEndpointUrlForExportFormat(exportFormat: string): string {
    return `${this.getFullEndpointUrl()}/${exportFormat}`;
  }
}
