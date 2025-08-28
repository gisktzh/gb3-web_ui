import {Pipe, PipeTransform, inject} from '@angular/core';
import {GeoshopApiService} from '../../shared/services/apis/geoshop/services/geoshop-api.service';

@Pipe({name: 'dataDownloadOrderDownloadUrl'})
export class DataDownloadOrderDownloadUrlPipe implements PipeTransform {
  private readonly geoshopApiService = inject(GeoshopApiService);

  public transform(orderId: string): string {
    return this.geoshopApiService.createOrderDownloadUrl(orderId);
  }
}
