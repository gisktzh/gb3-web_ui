import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {CreateCreateData, CreateCreatePayload, InfoJsonListData} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PrintCreation, PrintCreationResponse, PrintInfo, PrintOrientation} from '../../../interfaces/print.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3PrintService extends Gb3ApiService {
  protected readonly endpoint = 'print';
  private readonly postHeaders = {accept: 'application/json'};

  public loadPrintInfo(): Observable<PrintInfo> {
    const printInfoData = this.get<InfoJsonListData>(this.createInfoUrl());
    return printInfoData.pipe(map((data) => this.mapInfoJsonListDataToPrintInfo(data)));
  }

  public createPrintJob(printCreation: PrintCreation): Observable<PrintCreationResponse> {
    const createCreatePayload: CreateCreatePayload = this.mapPrintCreationToCreateCreatePayload(printCreation);
    return this.post<CreateCreatePayload, CreateCreateData>(this.createCreateUrl(), createCreatePayload, this.postHeaders).pipe(
      map((response) => {
        return {...response};
      }),
    );
  }

  protected override getFullEndpointUrl(): string {
    // TODO Remove this override method as soon as the API gets fixed
    return `${this.configService.apiConfig.gb2StaticFiles.baseUrl}/${this.endpoint}`;
  }

  private createInfoUrl(): string {
    return `${this.getFullEndpointUrl()}/info.json`;
  }

  private createCreateUrl(): string {
    return `${this.getFullEndpointUrl()}/create`;
  }

  private mapInfoJsonListDataToPrintInfo(data: InfoJsonListData): PrintInfo {
    return {
      ...data,
      outputFormats: data.outputFormats ?? [],
      scales: data.scales ?? [],
      dpis: data.dpis ?? [],
      layouts: data.layouts
        ? data.layouts.map((layout) => {
            const {size, orientation} = this.transformLayoutNameToSizeAndOrientation(layout.name);
            return {
              name: layout.name,
              map: layout.map,
              rotation: layout.rotation,
              size: size,
              orientation: orientation,
            };
          })
        : [],
    };
  }

  private mapPrintCreationToCreateCreatePayload(printCreation: PrintCreation): CreateCreatePayload {
    return {
      dpi: printCreation.dpi,
      layout: this.transformSizeAndOrientationToLayoutName(printCreation.layoutSize, printCreation.layoutOrientation),
      srs: printCreation.srs,
      outputFormat: printCreation.outputFormat,
      units: printCreation.units,
      pages: printCreation.pages.map((page) => {
        return {
          center: page.center,
          scale: page.scale,
          extent: page.extent,
          rotation: page.rotation,
          topic: page.topic,
          header_img: page.headerImg,
          topic_title: page.topicTitle,
          user_comment: page.userComment,
          user_title: page.userTitle,
          withlegend: page.withLegend ? 1 : 0,
        };
      }),
      layers: printCreation.layers.map((layer) => {
        return {
          layers: layer.layers,
          type: layer.type,
          baseURL: layer.baseURL,
          format: layer.format,
          opacity: layer.opacity,
          singleTile: layer.singleTile,
          styles: layer.styles,
          customParams: layer.customParams
            ? {
                format: layer.customParams.format,
                dpi: layer.customParams.dpi,
                TRANSPARENT: layer.customParams.transparent,
              }
            : null,
        };
      }),
    };
  }

  /**
   * Transforms the given layout string (e.g. `A4 hoch`) into size (`A4`) and orientation (`hoch`)
   */
  private transformLayoutNameToSizeAndOrientation(name: string): {size: string; orientation: PrintOrientation | undefined} {
    const layout: {size: string; orientation: PrintOrientation | undefined} = {size: name, orientation: undefined};
    const splitName = name.split(' ');
    if (splitName.length === 2) {
      const size = splitName[0];
      let orientation: PrintOrientation | undefined;
      switch (splitName[1] as PrintOrientation) {
        case 'hoch':
        case 'quer':
          orientation = splitName[1] as PrintOrientation;
      }
      if (size && orientation) {
        layout.size = size;
        layout.orientation = orientation;
      }
    }
    return layout;
  }

  private transformSizeAndOrientationToLayoutName(size: string, orientation: PrintOrientation | undefined): string {
    if (!orientation) {
      return size;
    }
    return `${size} ${orientation}`;
  }
}
