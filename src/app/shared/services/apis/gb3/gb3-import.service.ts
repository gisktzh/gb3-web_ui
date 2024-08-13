import {Gb3ApiService} from './gb3-api.service';
import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3ImportService extends Gb3ApiService {
  protected readonly endpoint = 'import';

  constructor(@Inject(HttpClient) http: HttpClient, @Inject(ConfigService) configService: ConfigService) {
    super(http, configService);
  }

  public importDrawing(file: File | Blob) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.post<FormData, Gb3VectorLayer>(this.getFullEndpointUrl(), formData);
  }
}
