import {FatalError, RecoverableError} from './abstract.errors';

export class TopicsCouldNotBeLoaded extends FatalError {
  public override message = 'Topics konnten nicht geladen werden.';
}

export class MapCouldNotBeFound extends FatalError {
  public override message = 'Map wurde nicht gefunden.';
}

export class NavigatorNotAvailable extends RecoverableError {
  public override message = 'Der Browser unterstützt keine Lokalisierung.';
}

export class GeneralInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Allgemeine Infos konnten nicht geladen werden.';
}

export class FeatureInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Datensatzinfos konnten nicht geladen werden.';
}

export class LegendCouldNotBeLoaded extends RecoverableError {
  public override message = 'Legende konnte nicht geladen werden.';
}

export class InvalidTimeSliderConfiguration extends RecoverableError {
  constructor(reason: string) {
    super();
    this.message = `Ungültiger Timeslider: ${reason}`;
  }
}
