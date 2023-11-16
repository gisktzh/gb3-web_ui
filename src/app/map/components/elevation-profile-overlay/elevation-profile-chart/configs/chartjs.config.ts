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
      grid: {
        drawOnChartArea: false,
      },
      type: 'linear',
    },
    y: {
      grid: {
        drawOnChartArea: false,
      },
      beginAtZero: true,
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
