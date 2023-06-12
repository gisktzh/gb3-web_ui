import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {GeneralInfoListData} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {GeneralInfoResponse} from '../../../interfaces/general-info.interface';
import {map} from 'rxjs/operators';
import {Geometry} from 'geojson';
import {SupportedSrs} from '../../../types/supported-srs';
import {NumberUtils} from '../../../utils/number.utils';

const GENERAL_INFO_SRS: SupportedSrs = 2056;

@Injectable({
  providedIn: 'root'
})
export class Gb3GeneralInfoService extends Gb3ApiService {
  protected readonly endpoint = 'general_info';

  public loadGeneralInfo(x: number, y: number): Observable<GeneralInfoResponse> {
    const generalInfoData = this.get<GeneralInfoListData>(this.createUrlForLocation(x, y));

    return generalInfoData.pipe(map((generalInfoListData) => this.mapGeneralInfoListDataToGeneralInfoResponse(generalInfoListData)));
  }

  private createUrlForLocation(x: number, y: number): string {
    const url = new URL(this.getFullEndpointUrl());
    url.searchParams.append('x', x.toString());
    url.searchParams.append('y', y.toString());
    return url.toString();
  }

  private mapGeneralInfoListDataToGeneralInfoResponse(generalInfoListData: GeneralInfoListData): GeneralInfoResponse {
    const generalInfo = generalInfoListData.general_info;
    return {
      alternativeSpatialReferences: generalInfo.alternative_spatial_references,
      externalMaps: generalInfo.external_maps,
      locationInformation: {
        crs: generalInfo.crs,
        heightDom: NumberUtils.roundToDecimals(generalInfo.height_dom, 1),
        heightDtm: NumberUtils.roundToDecimals(generalInfo.height_dtm, 1),
        lv95x: NumberUtils.roundToDecimals(generalInfo.lv95_e, 2),
        lv95y: NumberUtils.roundToDecimals(generalInfo.lv95_n, 2)
      },
      parcel: generalInfo.parcel
        ? {
            ...generalInfo.parcel,
            egrisEgrid: generalInfo.parcel.egris_egrid,
            municipalityName: generalInfo.parcel.municipality_name,
            oerebExtract: {
              jsonUrl: generalInfo.parcel.oereb_extract.json_url,
              xmlUrl: generalInfo.parcel.oereb_extract.xml_url,
              pdfUrl: generalInfo.parcel.oereb_extract.pdf_url,
              gb2Url: generalInfo.parcel.oereb_extract.gb2_url
            },
            // TODO: replace this explicit cast as soon as the API documentation is complete and contains the 'geometry'.
            geometry: {...(generalInfo.parcel.geometry as Geometry), srs: GENERAL_INFO_SRS}
          }
        : undefined
    };
  }
}
