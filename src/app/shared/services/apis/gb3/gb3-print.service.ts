/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  PrintCapabilities,
  PrintCreation,
  PrintCreationResponse,
  PrintMapItem,
  ReportOrientation,
} from '../../../interfaces/print.interface';
import {
  PrintCapabilitiesListData,
  PrintCreateData,
  PrintFeatureInfoCreateData,
  PrintFeatureInfoNew,
  PrintLegendCreateData,
  PrintLegendNew,
  PrintNew,
} from '../../../models/gb3-api-generated.interfaces';
import {PrintableOverlayItem} from '../../../interfaces/overlay-print.interface';
import {UserDrawingLayer} from '../../../enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../../utils/symbolization-to-gb3-converter.utils';
import {ActiveMapItem} from '../../../../map/models/active-map-item.model';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {BasemapConfigService} from '../../../../map/services/basemap-config.service';
import {Gb3StyledInternalDrawingRepresentation} from '../../../interfaces/internal-drawing-representation.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3PrintService extends Gb3ApiService {
  protected readonly endpoint = 'print';

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(ConfigService) configService: ConfigService,
    private readonly basemapConfigService: BasemapConfigService,
  ) {
    super(http, configService);
  }

  public loadPrintCapabilities(): Observable<PrintCapabilities> {
    const printCapabilitiesData = this.get<PrintCapabilitiesListData>(this.createCapabilitiesUrl());
    return printCapabilitiesData.pipe(map((data) => this.mapPrintCapabilitiesListDataToPrintCapabilities(data)));
  }

  public createPrintJob(printCreation: PrintCreation): Observable<PrintCreationResponse> {
    const createCreatePayload: PrintNew = this.mapPrintCreationToCreateCreatePayload(printCreation);
    return this.post<PrintNew, PrintCreateData>(this.createCreateUrl(), createCreatePayload).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printLegend(items: PrintableOverlayItem[]): Observable<PrintCreationResponse> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return this.post<PrintLegendNew, PrintLegendCreateData>(this.createPrintLegendUrl(), {legend_topics: items}).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printFeatureInfo(items: PrintableOverlayItem[], x: number, y: number): Observable<PrintCreationResponse> {
    return this.post<PrintFeatureInfoNew, PrintFeatureInfoCreateData>(this.createFeatureInfoPrintUrl(), {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      query_topics: items,
      x,
      y,
    }).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  /**
   * Creates a PrintCreation object from the given parameters used to create a print job on the print API
   */
  public createPrintCreation(
    format: string | null | undefined,
    reportLayout: string | null | undefined,
    reportOrientation: ReportOrientation | null | undefined,
    title: string | null | undefined,
    comment: string | null | undefined,
    showLegend: boolean | null | undefined,
    scale: number | null | undefined,
    dpi: number | null | undefined,
    rotation: number | null | undefined,
    activeMapItems: ActiveMapItem[] | undefined,
    mapConfigState: MapConfigState | undefined,
    drawings: Gb3StyledInternalDrawingRepresentation[],
  ): PrintCreation {
    const mapItems = this.createPrintCreationMapItems(activeMapItems, mapConfigState, drawings);
    return {
      format: format ?? '',
      reportLayout: reportLayout ?? '',
      reportOrientation: reportOrientation ?? undefined,
      attributes: {
        reportTitle: mapItems
          .map((mapItem) => (mapItem.type === 'WMS' && !mapItem.background ? mapItem.mapTitle : undefined))
          .filter((mapItemTitle): mapItemTitle is string => !!mapItemTitle)
          .join(', '),
        userTitle: title ?? '',
        userComment: comment ?? '',
        showLegend: showLegend ?? false,
      },
      map: {
        scale: scale ?? 0,
        dpi: dpi ?? 0,
        center: [mapConfigState?.center.x ?? 0, mapConfigState?.center.y ?? 0],
        rotation: rotation ?? 0,
        mapItems: mapItems,
      },
    };
  }

  private createPrintCreationMapItems(
    activeMapItems: ActiveMapItem[] | undefined,
    mapConfigState: MapConfigState | undefined,
    drawings: Gb3StyledInternalDrawingRepresentation[],
  ): PrintMapItem[] {
    // order matters: the lowest index has the highest visibility
    const mapItems: PrintMapItem[] = [];

    // add all active map items
    if (activeMapItems) {
      activeMapItems
        .filter((activeMapItem) => activeMapItem.visible)
        .forEach((activeMapItem) => {
          switch (activeMapItem.settings.type) {
            case 'drawing':
              mapItems.push(this.printDrawingLayer(activeMapItem.settings.userDrawingLayer, drawings));
              break;
            case 'gb2Wms':
              mapItems.push({
                // order matters: the lowest index has the highest visibility
                layers: activeMapItem.settings.layers
                  .filter((layer) => layer.visible)
                  .map((layer) => layer.layer)
                  .reverse(), // reverse the order of the sublayers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the print API specs
                type: 'WMS',
                opacity: activeMapItem.opacity,
                url: activeMapItem.settings.url,
                mapTitle: activeMapItem.title,
                customParams: {
                  format: this.configService.gb2Config.wmsFormatMimeType,
                  transparent: true, // always true
                },
              });
              break;
            case 'externalService':
              // we do not print external map services
              break;
          }
        });
    }

    // add basemap
    const activeBasemapId = mapConfigState?.activeBasemapId;
    const activeBasemap = this.basemapConfigService.availableBasemaps.find((basemap) => basemap.id === activeBasemapId);
    if (activeBasemap) {
      switch (activeBasemap.type) {
        case 'blank':
          // a blank basemap does not have to be printed
          break;
        case 'wms':
          mapItems.push({
            layers: activeBasemap.layers.map((layer) => layer.name),
            type: 'WMS',
            opacity: 1,
            url: activeBasemap.url,
            mapTitle: activeBasemap.title,
            background: true,
          });
          break;
      }
    }

    // reverse the order as the print API uses an inverse positioning to draw them (lowest index has lowest visibility)
    return mapItems.reverse();
  }

  private printDrawingLayer(source: UserDrawingLayer, drawings: Gb3StyledInternalDrawingRepresentation[]): PrintMapItem {
    const drawingsToDraw = drawings.filter((drawing) => drawing.source === source);

    return SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(drawingsToDraw);
  }

  private createPrintLegendUrl(): string {
    return `${this.getFullEndpointUrl()}/legend`;
  }

  private createFeatureInfoPrintUrl(): string {
    return `${this.getFullEndpointUrl()}/feature_info`;
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
