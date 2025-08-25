import {Gb3ApiService} from './gb3-api.service';
import {Injectable} from '@angular/core';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3ImportService extends Gb3ApiService {
  protected readonly endpoint = 'import';

  public importDrawing(file: File | Blob) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.post<FormData, Gb3VectorLayer>(this.getFullEndpointUrl(), formData);
  }
}
