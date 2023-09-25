export interface PrintConfig {
  scales: PrintScale[];
  kartensetReportName: string;
}

export interface PrintScale {
  name: string;
  value: number;
}
