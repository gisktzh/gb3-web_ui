import {Image} from './image.interface';

export interface OerebExtractQueryLocation {
  x?: number;
  y?: number;
}

export interface OerebExtractMeasurementArea {
  areaM2: number;
  percentage: number;
}

export interface OerebExtractMeasurementLine {
  lineLength: number;
}

export interface OereExtractbMeasurementPoints {
  pointsCount: number;
}

export type OerebExtractMeasurement = OerebExtractMeasurementArea | OerebExtractMeasurementLine | OereExtractbMeasurementPoints;

export interface OerebExtractValue {
  title: string;
  href?: string;
}

export interface OerebExtractRestriction {
  id: number;
  name: string;
  illustration?: Image;
  measurement: OerebExtractMeasurement;
}

export interface OerebConcernedTheme {
  id: number;
  name: string;
  legalProvisions: OerebExtractValue[];
  laws: OerebExtractValue[];
  hints: OerebExtractValue[];
  resonsibleOffices: OerebExtractValue[];
  restrictions: OerebExtractRestriction[];
}

export interface OerebNotConcernedTheme {
  id: number;
  name: string;
  hints: OerebExtractValue[];
}

export interface OerebExtractResponse {
  municipalityName: string;
  municipalityCode: number;
  parcelNumber: string;
  egrid: string;
  kbo: OerebExtractValue;
  surveyor: OerebExtractValue;
  concernedThemes: OerebConcernedTheme[];
  notConcernedThemes: OerebNotConcernedTheme[];
  notAvailableThemes: OerebNotConcernedTheme[];
}
