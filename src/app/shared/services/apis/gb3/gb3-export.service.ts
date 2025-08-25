import {Gb3ApiService} from './gb3-api.service';
import {inject, Injectable} from '@angular/core';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {map} from 'rxjs';
import {ExportFormat} from '../../../enums/export-format.enum';
import {FileDownloadService} from '../../file-download-service';

@Injectable({
  providedIn: 'root',
})
export class Gb3ExportService extends Gb3ApiService {
  private readonly fileDownloadService = inject(FileDownloadService);

  protected readonly endpoint = 'export';

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
