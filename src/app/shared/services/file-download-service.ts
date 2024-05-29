import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class FileDownloadService {
  public downloadFileFromUrl(url: string, fileName?: string): void {
    saveAs(url, fileName);
  }

  public downloadFileFromBlob(blob: Blob, fileName?: string): void {
    saveAs(blob, fileName);
  }
}
