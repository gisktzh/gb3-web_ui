import {PrintConfig} from '../interfaces/print-config.interface';
import {DocumentFormat, FileFormat} from '../interfaces/print-rules.interface';

export const printConfig: PrintConfig = {
  scales: [500, 1000, 2500, 5000, 10000, 15000, 25000, 50000, 100000, 200000, 500000],
  pixelSizes: {
    A0: {
      landscape: {
        width: 3300,
        height: 2070,
      },
      portrait: {
        width: 2290,
        height: 3020,
      },
    },
    A1: {
      landscape: {
        width: 2320,
        height: 1340,
      },
      portrait: {
        width: 1620,
        height: 2050,
      },
    },
    A2: {
      landscape: {
        width: 1600,
        height: 970,
      },
      portrait: {
        width: 1118,
        height: 1430,
      },
    },
    A3: {
      landscape: {
        width: 1120,
        height: 670,
      },
      portrait: {
        width: 770,
        height: 1010,
      },
    },
    A4: {
      landscape: {
        width: 770,
        height: 420,
      },
      portrait: {
        width: 520,
        height: 660,
      },
    },
  },
  defaultPrintValues: {
    reportType: 'standard',
    documentFormat: DocumentFormat.A4,
    fileFormat: FileFormat.pdf,
    dpiSetting: 300,
    orientation: 'portrait',
    legend: true,
    rotation: 0,
  },
  defaultMapSetPrintValues: {
    reportType: 'mapset',
    documentFormat: DocumentFormat.A4,
    fileFormat: FileFormat.pdf,
    dpiSetting: 300,
    orientation: 'landscape',
    legend: true,
    rotation: 0,
  },
};
