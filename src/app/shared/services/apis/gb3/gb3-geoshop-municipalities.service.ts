import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {MunicipalitiesDetailData, MunicipalitiesListData} from '../../../models/gb3-api-generated.interfaces';
import {map} from 'rxjs/operators';
import {Municipality, MunicipalityWithGeometry} from '../../../interfaces/gb3-geoshop-product.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';

@Injectable({
  providedIn: 'root',
})
export class Gb3GeoshopMunicipalitiesService extends Gb3ApiService {
  protected readonly endpoint = 'municipalities';

  public loadMunicipalities(): Observable<Municipality[]> {
    const municipalitiesListData = this.get<MunicipalitiesListData>(this.getFullEndpointUrl());
    return municipalitiesListData.pipe(map((data) => this.mapMunicipalitiesListDataToMunicipalities(data)));
  }

  public loadMunicipalityWithGeometry(bfsNo: number): Observable<MunicipalityWithGeometry> {
    const municipalitiesDetailData = this.get<MunicipalitiesDetailData>(this.createMunicipalityUrl(bfsNo));
    return municipalitiesDetailData.pipe(map((data) => this.mapMunicipalitiesDetailDataToMunicipality(data)));
  }

  private createMunicipalityUrl(bfsNo: number): string {
    return `${this.getFullEndpointUrl()}/${bfsNo}`;
  }

  private mapMunicipalitiesListDataToMunicipalities(data: MunicipalitiesListData): Municipality[] {
    return data.map(
      (municipality): Municipality => ({
        bfsNo: municipality.bfs_no,
        name: municipality.name,
      }),
    );
  }

  private mapMunicipalitiesDetailDataToMunicipality(data: MunicipalitiesDetailData): MunicipalityWithGeometry {
    return {
      bfsNo: data.bfs_no,
      name: data.name,
      boundingBox: ApiGeojsonGeometryToGb3ConverterUtils.convert(data.boundingbox),
    };
  }
}
