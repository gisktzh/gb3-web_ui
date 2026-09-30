import {Injectable} from '@angular/core';
import {defer, forkJoin, map, Observable, of} from 'rxjs';
import {statisticsMapQueries} from '../../../configs/statistics.config';
import {DataCataloguePage} from '../../../enums/data-catalogue-page.enum';
import {MainPage} from '../../../enums/main-page.enum';
import {GeometryWithSrs} from '../../../interfaces/geojson-types-with-srs.interface';
import {StatisticsResult, StatisticsResultLayer} from '../../../interfaces/statistics.interface';
import {
  StatisticInfo,
  StatisticInfoQueryParameters,
  StatisticOperation,
  TopicsStatisticInfoListData,
} from '../../../models/gb3-api-generated.interfaces';
import {StatisticsService} from './abstract-statistics.service';
import {Gb3ApiService} from './gb3-api.service';

const statisticTitles: Record<StatisticOperation, string> = {
  sum: 'Summe',
  mean: 'Mittelwert',
  median: 'Median',
  min: 'Minimum',
  max: 'Maximum',
};

@Injectable({
  providedIn: 'root',
})
export class Gb3StatisticsService extends Gb3ApiService implements StatisticsService {
  protected readonly endpoint = 'topics';

  public loadStatistics(geometry: GeometryWithSrs): Observable<StatisticsResult[]> {
    return defer(() => {
      if (geometry.type !== 'Polygon') {
        throw new Error(`Unsupported statistics geometry: ${geometry.type}. Expected a Polygon.`);
      }

      const polygon = `POLYGON(${geometry.coordinates.map((ring) => `(${ring.map(([x, y]) => `${x} ${y}`).join(',')})`).join(',')})`;
      const requests = Object.entries(statisticsMapQueries)
        .filter(([, queries]) => queries.length > 0)
        .map(([topic, queries]) =>
          forkJoin(
            queries.map((query) =>
              this.get<TopicsStatisticInfoListData>(
                this.createStatisticsUrl(topic, {...query, geometry: polygon, srid: geometry.srs}),
              ).pipe(map((response) => response.statistic_info)),
            ),
          ).pipe(map((results) => this.mapStatisticsResult(results))),
        );

      return requests.length > 0 ? forkJoin(requests) : of([]);
    });
  }

  private createStatisticsUrl(topic: string, query: StatisticInfoQueryParameters): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${topic}/statistic_info`);
    url.searchParams.set('layer', query.layer);
    url.searchParams.set('field', typeof query.field === 'string' ? query.field : query.field.join(','));
    url.searchParams.set('statistic', query.statistic);
    url.searchParams.set('geometry', query.geometry);
    url.searchParams.set('srid', query.srid.toString());
    return url.toString();
  }

  private mapStatisticsResult(results: StatisticInfo[]): StatisticsResult {
    const first = results[0];
    return {
      topic: first.topic,
      title: first.topic_title,
      metaDataLink: first.geolion_karten_uuid ? `/${MainPage.Data}/${DataCataloguePage.Maps}/${first.geolion_karten_uuid}` : undefined,
      layers: results.map((result): StatisticsResultLayer => ({
        layer: result.layer,
        title: result.layer_title,
        metaDataLink: result.geolion_geodatensatz_uuid
          ? `/${MainPage.Data}/${DataCataloguePage.Datasets}/${result.geolion_geodatensatz_uuid}`
          : undefined,
        columns: [statisticTitles[result.statistic]],
        status: result.fields.some((field) => result.results[field].count > 0) ? 'ok' : 'noData',
        rows: result.fields.map((field) => ({
          label: result.results[field].alias,
          values: [{value: this.parseValue(result.results[field].value, field), unit: null}],
          isGroupHeader: false,
        })),
      })),
    };
  }

  private parseValue(value: number | string | null, field: string): number | null {
    if (value === null) {
      return null;
    }

    const numericValue = typeof value === 'number' ? value : Number(value);
    if ((typeof value === 'string' && value.trim() === '') || !Number.isFinite(numericValue)) {
      throw new Error(`Invalid statistics value for field "${field}": ${value}`);
    }
    return numericValue;
  }
}
