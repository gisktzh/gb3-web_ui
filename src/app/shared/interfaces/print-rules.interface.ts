/* eslint-disable @typescript-eslint/naming-convention -- maps to the GB2 backend conventions */
export enum DocumentFormat {
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
}

/**
 * These choices are used in the GUI to populate the dropdown.
 */
export enum DpiSetting {
  low = 150,
  high = 300,
}

/**
 * These choices are used in the GUI to populate the dropdown.
 */
export enum FileFormat {
  pdf = 'pdf',
  png = 'png',
  tif = 'tif',
  gif = 'gif',
}
