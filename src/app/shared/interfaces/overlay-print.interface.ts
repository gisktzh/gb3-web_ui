import {FeatureInfoQueryLocation} from './feature-info.interface';

export interface PrintableOverlayItem {
  topic: string;
  layers: string[];
}

export interface FeatureInfoPrintConfiguration extends FeatureInfoQueryLocation {
  items: PrintableOverlayItem[];
}
