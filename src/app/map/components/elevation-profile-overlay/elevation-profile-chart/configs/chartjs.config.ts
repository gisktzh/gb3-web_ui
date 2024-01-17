import {ElevationProfileChartJsDataset, ElevationProfileChartJsOptions} from '../interfaces/chartjs.interface';

export const ELEVATION_PROFILE_CHARTJS_OPTIONS: ElevationProfileChartJsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      pointStyle: false,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    tooltip: {
      enabled: true,
      position: 'nearest',
    },
  },
  scales: {
    x: {
      title: {text: 'Distanz [m]', display: true},
      grid: {
        drawOnChartArea: true,
      },
      type: 'linear',
    },
    y: {
      title: {text: 'Höhe über Meer [m]', display: true},
      grid: {
        drawOnChartArea: true,
      },
      beginAtZero: false,
    },
  },
};

export const ELEVATION_PROFILE_CHARTJS_DATASET: ElevationProfileChartJsDataset = {
  data: [],
  parsing: {
    xAxisKey: 'distance',
    yAxisKey: 'altitude',
  },
  fill: true,
  tension: 0.5,
  borderColor: 'rgba(255,0,0,0.8)',
  backgroundColor: 'rgba(255,0,0,0.3)',
};
