import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ElevationProfileData, ElevationProfileDataPoint} from '../../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileChartJsDataConfiguration} from './types/chartjs.type';
import {ElevationPlotConfigService} from './services/elevation-plot-config.service';
import {ElevationProfileChartJsOptions} from './interfaces/chartjs.interface';
import {Store} from '@ngrx/store';
import {ElevationProfileActions} from '../../../../state/map/actions/elevation-profile.actions';

const VERTIXAL_AXIS_LABEL = 'MüM';

@Component({
  selector: 'elevation-profile-chart',
  templateUrl: './elevation-profile-chart.component.html',
  styleUrls: ['./elevation-profile-chart.component.scss'],
})
export class ElevationProfileChartComponent implements OnInit, AfterViewInit {
  @Input() public elevationProfileData!: ElevationProfileData;
  public readonly lineChartData: ElevationProfileChartJsDataConfiguration = {
    datasets: [],
  };
  @ViewChild('chart') private elevationChart!: ElementRef;

  public readonly lineChartOptions: ElevationProfileChartJsOptions = this.elevationPlotConfigService.getElevationPlotChartOptions();

  constructor(
    private readonly elevationPlotConfigService: ElevationPlotConfigService,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    if (this.elevationProfileData.dataPoints.length > 1) {
      this.updateData(this.elevationProfileData.dataPoints, this.elevationProfileData.statistics.linearDistance);
    }
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      const downloadLink: string = this.elevationChart.nativeElement.toDataURL('image/png');
      this.store.dispatch(ElevationProfileActions.createImageDownloadLink({downloadLink}));
    }, 100);
  }

  private updateData(elevationProfileData: ElevationProfileDataPoint[], maxDistance: number) {
    this.lineChartData.datasets.push(
      this.elevationPlotConfigService.createElevationProfileDataset(elevationProfileData, VERTIXAL_AXIS_LABEL),
    );
    this.lineChartOptions.scales.x.max = maxDistance;
  }
}
