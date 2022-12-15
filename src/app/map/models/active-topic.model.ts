import {Topic} from '../../shared/models/gb3-api.interfaces';

export class ActiveTopic {
  public readonly topic: Topic;

  constructor(topic: Topic) {
    this.topic = topic;
  }
}
