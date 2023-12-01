export class DataDownloadConstants {
  public static readonly ABORTED_STATUS_JOB_TEXT =
    'Beim Aktualisieren einer Bestellung sind mehrere Fehler aufgetreten und der Prozess wurde abgebrochen.';
  public static readonly CANCELLED_STATUS_JOB_TEXT = 'Die Bestellung wurde abgebrochen.';
  public static readonly NEW_STATUS_JOB_TEXT = 'Die Bestellung wird an den Server gesendet.';
  public static readonly STATUS_JOB_SUBMITTED_TEXT = 'Die Bestellung ist beim Server eingegangen.';
  public static readonly STATUS_JOB_QUEUED_TEXT = 'Die Bestellung wurde in die Warteschlange aufgenommen.';
  public static readonly STATUS_JOB_WORKING_TEXT = 'Die Bestellung wird bearbeitet.';
  public static readonly STATUS_JOB_SUCCESS_TEXT = 'Die Bestellung ist bereit.';
  public static readonly STATUS_JOB_FAILURE_DEFAULT_TEXT = 'Fehler: Die Bestellung ist fehlgeschlagen.';
  public static readonly STATUS_JOB_FAILURE_MESSAGE_PREFIX = 'Fehler:';
  public static readonly STATUS_JOB_UNKNOWN_TEXT = 'Unbekannter Zustand.';
}
