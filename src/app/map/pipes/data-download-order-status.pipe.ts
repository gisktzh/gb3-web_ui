import {Pipe, PipeTransform} from '@angular/core';
import {OrderStatusJob} from '../../shared/interfaces/geoshop-order-status.interface';

@Pipe({
  name: 'dataDownloadOrderStatus',
})
export class DataDownloadOrderStatusPipe implements PipeTransform {
  public transform(orderStatusJob: OrderStatusJob): string {
    if (!orderStatusJob.status) {
      return 'Die Bestellung wird an den Server gesendet';
    }
    switch (orderStatusJob.status.status.type) {
      case 'submitted':
        return 'Die Bestellung ist beim Server eingegangen';
      case 'queued':
        return 'Die Bestellung wurde in die Warteschlange aufgenommen';
      case 'working':
        return 'Die Bestellung wird bearbeitet';
      case 'success':
        return 'Die Bestellung ist bereit';
      case 'failure':
        if (orderStatusJob.status.status.message) {
          return `Fehler: '${orderStatusJob.status.status.message}'`;
        }
        return 'Fehler: Die Bestellung ist fehlgeschlagen';
      case 'unknown':
        return 'Unbekannter Zustand';
    }
  }
}
