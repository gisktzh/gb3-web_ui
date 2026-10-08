import {QueryResultStatus} from '../types/query-result-status.type';
import {StatisticInfoQueryParameters} from '../models/gb3-api-generated.interfaces';
import {GeometryWithSrs} from './geojson-types-with-srs.interface';

export interface StatisticsQuery extends Omit<StatisticInfoQueryParameters, 'geometry' | 'srid'> {
  topic: string;
}

export interface StatisticsLayerIdentifier {
  topic: string;
  layer: string;
}

export interface StatisticsResultValue {
  value: number | null;
  /** Rendered inline after the value, e.g. "2'166 Betriebe". */
  unit: string | null;
}

export interface StatisticsResultRow {
  label: string;
  /** One entry per column, in the same order as the layer's `columns`. Empty for group headers. */
  values: StatisticsResultValue[];
  isGroupHeader: boolean;
}

export interface StatisticsResultLayer {
  layer: string;
  title: string;
  metaDataLink?: string;
  featureGeometry?: GeometryWithSrs;
  /** Display labels for the aggregate columns, e.g. ['Summe']. */
  columns: string[];
  rows: StatisticsResultRow[];
  status: QueryResultStatus;
}

export interface StatisticsResult {
  topic: string;
  title: string;
  icon?: string;
  metaDataLink?: string;
  layers: StatisticsResultLayer[];
}
