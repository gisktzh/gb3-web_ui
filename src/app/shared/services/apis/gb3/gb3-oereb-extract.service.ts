import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {
  OerebConcernedTheme,
  OerebExtractResponse,
  OerebExtractValue,
  OerebExtractMeasurement,
  OerebNotConcernedTheme,
  OerebExtractRestriction,
} from 'src/app/shared/interfaces/oereb-extract.interface';
import {map, Observable} from 'rxjs';
import {
  NotConcernedTheme as OerebAPINotConcernedTheme,
  OerebFeature as OerebAPIFeature,
  LinkObject,
} from 'src/app/shared/models/gb3-api-generated.interfaces';

type OerebAPIMeasurement = OerebAPIFeature['oereb_info']['concerned_themes'][0]['restrictions'][0]['measurement'];

@Injectable({
  providedIn: 'root',
})
export class Gb3OerebExtractService extends Gb3ApiService {
  protected endpoint: string = 'oereb';

  public loadOerebExtract(x: number, y: number): Observable<OerebExtractResponse | null> {
    const oerebExtractData = this.get<OerebAPIFeature>(this.createFullEndpointUrl(x, y));

    return oerebExtractData.pipe(map((oerebExtract) => this.mapOerebFeatureDataToOerebExtractResponse(oerebExtract)));
  }

  private createFullEndpointUrl(x: number, y: number) {
    const url = new URL(this.getFullEndpointUrl());
    url.searchParams.append('x', x.toString());
    url.searchParams.append('y', y.toString());

    return url.toString();
  }

  private mapOerebFeatureDataToOerebExtractResponse(data: OerebAPIFeature | null): OerebExtractResponse | null {
    if (data === null) {
      return null;
    }

    const info = data.oereb_info;

    return {
      municipalityName: info.municipality_name,
      municipalityCode: info.municipality_code,
      parcelNumber: info.parcel_number,
      egrid: info.egrid,
      kbo: this.mapLinkObjectToOerebValue(info.kbo),
      surveyor: this.mapLinkObjectToOerebValue(info.surveyor),
      concernedThemes: info.concerned_themes.map(
        (t): OerebConcernedTheme => ({
          id: t.id,
          name: t.name,
          restrictions: t.restrictions.map(
            (r): OerebExtractRestriction => ({
              id: r.id,
              name: r.name,
              illustration: r.illustration_url,
              measurement: this.mapMeasurement(r.measurement),
            }),
          ),
          legalProvisions: t.legal_provisions.map((v) => this.mapLinkObjectToOerebValue(v)),
          laws: t.laws.map((v) => this.mapLinkObjectToOerebValue(v)),
          hints: t.hints.map((v) => this.mapLinkObjectToOerebValue(v)),
          resonsibleOffices: t.responsible_offices.map((v) => this.mapLinkObjectToOerebValue(v)),
        }),
      ),
      notConcernedThemes: info.not_concerned_themes.map((t) =>
        this.mapNotConcernedThemeFromOerebfeatureTooOerebExtratResponseNotConcernedTheme(t),
      ),
      notAvailableThemes: info.not_available_themes.map((t) =>
        this.mapNotConcernedThemeFromOerebfeatureTooOerebExtratResponseNotConcernedTheme(t),
      ),
    };
  }

  private mapNotConcernedThemeFromOerebfeatureTooOerebExtratResponseNotConcernedTheme(
    data: OerebAPINotConcernedTheme,
  ): OerebNotConcernedTheme {
    return {...data};
  }

  private mapLinkObjectToOerebValue(v: LinkObject): OerebExtractValue {
    return {
      title: v.title || '',
      href: v.href,
    };
  }

  private mapMeasurement(v: OerebAPIMeasurement): OerebExtractMeasurement {
    if ('area_m2' in v) {
      return {
        areaM2: v.area_m2,
        percentage: v.percentage,
      };
    }

    if ('line_length' in v) {
      return {
        lineLength: v.line_length,
      };
    }

    return {
      pointsCount: v.points_count,
    };
  }
}
