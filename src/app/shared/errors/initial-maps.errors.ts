import {RecoverableError} from './abstract.errors';

export class SomeTopicsCouldNotBeLoaded extends RecoverableError {
  public override name = 'SomeTopicsCouldNotBeLoaded';

  constructor(topicIds: string[]) {
    super();
    this.message = `Folgende Karten konnten nicht geladen werden: ${topicIds.map((topicId) => `"${topicId}"`).join(', ')}.`;
  }
}
