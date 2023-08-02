import {FatalError, RecoverableError} from './abstract.errors';

export class TopicsCouldNotBeLoaded extends FatalError {
  public override message = 'Topics konnten nicht geladen werden.';
  public override name = 'TopicsCouldNotBeLoaded';
}

export class MapCouldNotBeFound extends FatalError {
  public override message = 'Karte wurde nicht gefunden.';
  public override name = 'MapCouldNotBeFound';
}

export class NavigatorNotAvailable extends RecoverableError {
  public override message = 'Der Browser unterstützt keine Lokalisierung.';
  public override name = 'NavigatorNotAvailable';
}

export class GeneralInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Allgemeine Infos konnten nicht geladen werden.';
  public override name = 'GeneralInfoCouldNotBeLoaded';
}

export class FeatureInfoCouldNotBeLoaded extends RecoverableError {
  public override message = 'Datensatzinfos konnten nicht geladen werden.';
  public override name = 'FeatureInfoCouldNotBeLoaded';
}

export class LegendCouldNotBeLoaded extends RecoverableError {
  public override message = 'Legende konnte nicht geladen werden.';
  public override name = 'LegendCouldNotBeLoaded';
}

export class InvalidTimeSliderConfiguration extends RecoverableError {
  public override name = 'InvalidTimeSliderConfiguration';

  constructor(reason: string) {
    super();
    this.message = `Ungültiger Timeslider: ${reason}`;
  }
}
