import {RecoverableError} from '../../error-handling/models/errors';

export class InvalidTimeSliderConfiguration extends RecoverableError {
  constructor(reason: string) {
    super();
    this.message = `Ungültiger Timeslider: ${reason}`;
  }
}
