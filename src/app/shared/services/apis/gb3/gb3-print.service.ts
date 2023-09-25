import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PrintCapabilities, PrintCreation, PrintCreationResponse, ReportOrientation} from '../../../interfaces/print.interface';
import {PrintCapabilitiesListData, PrintCreateData, PrintNew} from '../../../models/gb3-api-generated.interfaces';

@Injectable({
  providedIn: 'root',
})
export class Gb3PrintService extends Gb3ApiService {
  protected readonly endpoint = 'print';
  private readonly postHeaders = {accept: 'application/json'};

  public loadPrintCapabilities(): Observable<PrintCapabilities> {
    const printCapabilitiesData = this.get<PrintCapabilitiesListData>(this.createCapabilitiesUrl());
    return printCapabilitiesData.pipe(map((data) => this.mapPrintCapabilitiesListDataToPrintCapabilities(data)));
  }

  public createPrintJob(printCreation: PrintCreation): Observable<PrintCreationResponse> {
    const createCreatePayload: PrintNew = this.mapPrintCreationToCreateCreatePayload(printCreation);
    return this.post<PrintNew, PrintCreateData>(this.createCreateUrl(), createCreatePayload, this.postHeaders).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  private createCapabilitiesUrl(): string {
    return `${this.getFullEndpointUrl()}/capabilities`;
  }

  private createCreateUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  private mapPrintCapabilitiesListDataToPrintCapabilities(data: PrintCapabilitiesListData): PrintCapabilities {
    const printData = data.print;
    return {
      dpis: printData.dpis,
      formats: printData.formats,
      reports: printData.reports.map((report) => {
        const {layout, orientation} = this.transformReportNameToLayoutAndOrientation(report.name);
        return {
          map: report.map,
          layout: layout,
          orientation: orientation,
        };
      }),
    };
  }

  private mapPrintCreationToCreateCreatePayload(printCreation: PrintCreation): PrintNew {
    return {
      report: this.transformSizeAndOrientationToLayoutName(printCreation.reportLayout, printCreation.reportOrientation),
      format: printCreation.format,
      map: {
        dpi: printCreation.map.dpi,
        rotation: printCreation.map.rotation,
        center: printCreation.map.center,
        scale: printCreation.map.scale,
        layers: printCreation.map.mapItems.map((mapItem) => {
          switch (mapItem.type) {
            case 'Vector':
              return {
                type: 'Vector',
                geojson: mapItem.geojson,
                styles: mapItem.styles,
              };
            case 'WMS':
              return {
                type: 'WMS',
                url: mapItem.url,
                layers: mapItem.layers,
                custom_params: mapItem.customParams,
                opacity: mapItem.opacity,
                map_title: mapItem.mapTitle,
                background: mapItem.background,
              };
          }
        }),
      },
      attributes: {
        report_title: printCreation.attributes.reportTitle,
        show_legend: printCreation.attributes.showLegend,
        user_comment: printCreation.attributes.userComment,
        user_title: printCreation.attributes.userTitle,
      },
    };
  }

  /**
   * Transforms the given layout string (e.g. `A4 hoch`) into size (`A4`) and orientation (`hoch`)
   */
  private transformReportNameToLayoutAndOrientation(name: string): {layout: string; orientation: ReportOrientation | undefined} {
    const report: {layout: string; orientation: ReportOrientation | undefined} = {layout: name, orientation: undefined};
    const splitName = name.split(' ');
    if (splitName.length === 2) {
      const size = splitName[0];
      let orientation: ReportOrientation | undefined;
      switch (splitName[1] as ReportOrientation) {
        case 'hoch':
        case 'quer':
          orientation = splitName[1] as ReportOrientation;
      }
      if (size && orientation) {
        report.layout = size;
        report.orientation = orientation;
      }
    }
    return report;
  }

  private transformSizeAndOrientationToLayoutName(size: string, orientation: ReportOrientation | undefined): string {
    if (!orientation) {
      return size;
    }
    return `${size} ${orientation}`;
  }
}
