import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {GeometryWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {StatisticsResult} from '../../../interfaces/statistics.interface';
import {StatisticsService} from './abstract-statistics.service';

const mockData: StatisticsResult[] = [
  {
    topic: 'Wirtschaft und Arbeit',
    title: 'Beschäftigtenstatistik im ausgewählten Gebiet',
    metaDataLink: 'https://www.geolion.zh.ch/geodatensatz/show?gdsid=1927',
    layers: [
      {
        layer: 'beschaeftigte_wirtschaftssektor',
        title: 'Beschäftigte nach Wirtschaftssektor',
        columns: ['Anzahl', 'Anteil'],
        status: 'ok',
        rows: [
          {
            label: 'Sektor I – Land- und Forstwirtschaft',
            values: [
              {value: null, unit: null},
              {value: null, unit: null},
            ],
            isGroupHeader: true,
          },
          {
            label: 'Land- und Forstwirtschaft',
            values: [
              {value: 42, unit: 'Beschäftigte'},
              {value: 0.3, unit: '%'},
            ],
            isGroupHeader: false,
          },
          {
            label: 'Sektor II – Produktion',
            values: [
              {value: null, unit: null},
              {value: null, unit: null},
            ],
            isGroupHeader: true,
          },
          {
            label: 'Industrie und verarbeitendes Gewerbe',
            values: [
              {value: 1942, unit: 'Beschäftigte'},
              {value: 15.6, unit: '%'},
            ],
            isGroupHeader: false,
          },
          {
            label: 'Baugewerbe',
            values: [
              {value: 1034, unit: 'Beschäftigte'},
              {value: 8.3, unit: '%'},
            ],
            isGroupHeader: false,
          },
          {
            label: 'Sektor III – Dienstleistungen',
            values: [
              {value: null, unit: null},
              {value: null, unit: null},
            ],
            isGroupHeader: true,
          },
          {
            label: 'Handel, Verkehr und Gastgewerbe',
            values: [
              {value: 3412, unit: 'Beschäftigte'},
              {value: 27.3, unit: '%'},
            ],
            isGroupHeader: false,
          },
          {
            label: 'Information, Finanz- und Unternehmensdienstleistungen',
            values: [
              {value: 3965, unit: 'Beschäftigte'},
              {value: 31.8, unit: '%'},
            ],
            isGroupHeader: false,
          },
          {
            label: 'Öffentliche Verwaltung, Bildung und Gesundheit',
            values: [
              {value: 2088, unit: 'Beschäftigte'},
              {value: 16.7, unit: '%'},
            ],
            isGroupHeader: false,
          },
        ],
      },
      {
        layer: 'betriebe_groessenklasse',
        title: 'Betriebe nach Grössenklasse',
        columns: ['Summe'],
        status: 'ok',
        rows: [
          {
            label: 'Mikrobetriebe (1–9 Beschäftigte)',
            values: [{value: 1626, unit: 'Betriebe'}],
            isGroupHeader: false,
          },
          {
            label: 'Kleinbetriebe (10–49 Beschäftigte)',
            values: [{value: 418, unit: 'Betriebe'}],
            isGroupHeader: false,
          },
          {
            label: 'Mittelbetriebe (50–249 Beschäftigte)',
            values: [{value: 104, unit: 'Betriebe'}],
            isGroupHeader: false,
          },
          {
            label: 'Grossbetriebe (ab 250 Beschäftigte)',
            values: [{value: 18, unit: 'Betriebe'}],
            isGroupHeader: false,
          },
        ],
      },
    ],
  },
  {
    topic: 'Bevölkerung',
    title: 'Wohnbevölkerung im ausgewählten Gebiet',
    metaDataLink: 'https://www.geolion.zh.ch/geodatensatz/show?gdsid=2744',
    layers: [
      {
        layer: 'wohnbevoelkerung_altersstruktur',
        title: 'Wohnbevölkerung nach Altersklasse',
        columns: [],
        rows: [],
        status: 'noData',
      },
    ],
  },
  {
    topic: 'Bauen und Wohnen',
    title: 'Wohnungsbestand',
    metaDataLink: 'https://www.geolion.zh.ch/geodatensatz/show?gdsid=3318',
    layers: [
      {
        layer: 'wohnungen_bauperiode',
        title: 'Wohnungen nach Bauperiode',
        columns: [],
        rows: [],
        status: 'areaTooSmall',
      },
    ],
  },
  {
    topic: 'Naturgefahren',
    title: 'Gefahrenhinweise',
    metaDataLink: 'https://www.geolion.zh.ch/geodatensatz/show?gdsid=4482',
    layers: [
      {
        layer: 'hochwasser_gefahrengebiete',
        title: 'Hochwassergefährdung',
        columns: [],
        rows: [],
        status: 'notSupported',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class Gb3StatisticsMockService extends StatisticsService {
  public override loadStatistics(_geometry: GeometryWithSrs): Observable<StatisticsResult[]> {
    return of(mockData).pipe(delay(600));
  }
}
