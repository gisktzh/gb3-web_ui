import {Pipe, PipeTransform} from '@angular/core';
import {GeoshopApiService} from '../../shared/services/apis/geoshop/services/geoshop-api.service';

@Pipe({
  name: 'dataDownloadOrderDownloadUrl',
  standalone: false,
})
export class DataDownloadOrderDownloadUrlPipe implements PipeTransform {
  constructor(private readonly geoshopApiService: GeoshopApiService) {}

  public transform(orderId: string): string {
    return this.geoshopApiService.createOrderDownloadUrl(orderId);
  }
}
