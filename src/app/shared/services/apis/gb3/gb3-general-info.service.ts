import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {GeneralInfoListData} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {GeneralInfoResponse} from '../../../interfaces/general-info.interface';
import {map} from 'rxjs/operators';
import {ExternalUrlConstants} from '../../../constants/external-url.constants';

@Injectable({
  providedIn: 'root',
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
        heightDom: generalInfo.height_dom,
        heightDtm: generalInfo.height_dtm,
        spatialReference: generalInfo.spatial_reference,
      },
      parcel: generalInfo.parcel
        ? {
            bfsnr: generalInfo.parcel.bfsnr,
            egrisEgrid: generalInfo.parcel.egris_egrid,
            municipalityName: generalInfo.parcel.municipality_name,
            oerebExtract: {
              pdfUrl: generalInfo.parcel.oereb_extract.pdf_url,
            },
            ownershipInformation: {
              url: this.createOwnershipInformationUrl(generalInfo.parcel.egris_egrid, generalInfo.parcel.bfsnr),
            },
          }
        : undefined,
    };
  }

  private createOwnershipInformationUrl(egrid: string, bfsNr: number): string {
    const url = new URL(ExternalUrlConstants.OWNERSHIP_INFORMATION_BASE_URL);
    url.searchParams.append('egrid', egrid);
    url.searchParams.append('bfsNr', bfsNr.toString());

    return url.toString();
  }
}
