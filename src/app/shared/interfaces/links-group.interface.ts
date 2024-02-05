import {LinkObject} from './link-object.interface';
import {BaseUrl} from '../types/base-url.type';

export interface LinksGroup {
  label: string;
  links: ConfigurableLinkObject[];
}

interface ConfigurableLinkObject extends LinkObject {
  baseUrl?: BaseUrl;
}
