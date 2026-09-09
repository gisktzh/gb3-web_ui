import {QueryResultStatus} from '../types/query-result-status.type';

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
  /** The value column names are supplied by the API and differ per layer, e.g. ['Summe']. */
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
