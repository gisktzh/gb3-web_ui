import {HasVisibility} from '../../map/interfaces/has-visibility.interface';

export interface ExternalLayer<T extends string | number> extends HasVisibility {
  id: T;
  title: string;
  name?: string;
}
