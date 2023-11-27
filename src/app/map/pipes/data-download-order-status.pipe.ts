import {Pipe, PipeTransform} from '@angular/core';
import {OrderStatusJob} from '../../shared/interfaces/geoshop-order-status.interface';

@Pipe({
  name: 'dataDownloadOrderStatus',
})
export class DataDownloadOrderStatusPipe implements PipeTransform {
  public static readonly ABORTED_STATUS_JOB_TEXT =
    'Beim Aktualisieren einer Bestellung sind mehrere Fehler aufgetreten und der Prozess wurde abgebrochen.';
  public static readonly CANCELLED_STATUS_JOB_TEXT = 'Die Bestellung wurde abgebrochen.';
  public static readonly NEW_STATUS_JOB_TEXT = 'Die Bestellung wird an den Server gesendet.';
  public static readonly STATUS_JOB_SUBMITTED_TEXT = 'Die Bestellung ist beim Server eingegangen.';
  public static readonly STATUS_JOB_QUEUED_TEXT = 'Die Bestellung wurde in die Warteschlange aufgenommen.';
  public static readonly STATUS_JOB_WORKING_TEXT = 'Die Bestellung wird bearbeitet.';
  public static readonly STATUS_JOB_SUCCESS_TEXT = 'Die Bestellung ist bereit.';
  public static readonly STATUS_JOB_FAILURE_DEFAULT_TEXT = 'Fehler: Die Bestellung ist fehlgeschlagen.';
  public static readonly STATUS_JOB_UNKNOWN_TEXT = 'Unbekannter Zustand.';

  public transform(orderStatusJob: OrderStatusJob): string {
    if (orderStatusJob.isAborted) {
      return DataDownloadOrderStatusPipe.ABORTED_STATUS_JOB_TEXT;
    }
    if (orderStatusJob.isCancelled) {
      return DataDownloadOrderStatusPipe.CANCELLED_STATUS_JOB_TEXT;
    }
    if (!orderStatusJob.status) {
      return DataDownloadOrderStatusPipe.NEW_STATUS_JOB_TEXT;
    }
    switch (orderStatusJob.status.status.type) {
      case 'submitted':
        return DataDownloadOrderStatusPipe.STATUS_JOB_SUBMITTED_TEXT;
      case 'queued':
        return DataDownloadOrderStatusPipe.STATUS_JOB_QUEUED_TEXT;
      case 'working':
        return DataDownloadOrderStatusPipe.STATUS_JOB_WORKING_TEXT;
      case 'success':
        return DataDownloadOrderStatusPipe.STATUS_JOB_SUCCESS_TEXT;
      case 'failure':
        if (orderStatusJob.status.status.message) {
          return `Fehler: '${orderStatusJob.status.status.message}'`;
        }
        return DataDownloadOrderStatusPipe.STATUS_JOB_FAILURE_DEFAULT_TEXT;
      case 'unknown':
        return DataDownloadOrderStatusPipe.STATUS_JOB_UNKNOWN_TEXT;
    }
  }
}
