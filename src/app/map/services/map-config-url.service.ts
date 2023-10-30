import {Injectable} from '@angular/core';
import {ActivatedRoute, Params, QueryParamsHandling, Router} from '@angular/router';
import {OverlayType} from '../../shared/types/overlay.type';

@Injectable()
export class MapConfigUrlService {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  // TODO GB3-789 This method (and the complete rest of this service) can be removed as soon as the external info-/legend-print API is used.
  public async activatePrintMode(printType: OverlayType): Promise<void> {
    const queryParams = {print: printType};
    await this.updateQueryParams(queryParams, 'merge');
  }

  public async deactivatePrintMode(): Promise<void> {
    const {print, ...otherParams} = this.route.snapshot.queryParams;
    await this.updateQueryParams(otherParams);
  }

  private async updateQueryParams(queryParams: Params, queryParamsHandling: QueryParamsHandling | null = null): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling,
      replaceUrl: true,
    });
  }
}
