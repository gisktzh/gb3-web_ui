import {Component, Input, OnInit} from '@angular/core';
import {ElevationProfileData, ElevationProfileDataPoint} from '../../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileChartJsDataConfiguration} from './types/chartjs.type';
import {ElevationPlotConfigService} from './services/elevation-plot-config.service';
import {ElevationProfileChartJsOptions} from './interfaces/chartjs.interface';
import {BaseChartDirective} from 'ng2-charts';

const VERTIXAL_AXIS_LABEL = 'MüM';

@Component({
  standalone: true,
  selector: 'elevation-profile-chart',
  templateUrl: './elevation-profile-chart.component.html',
  styleUrls: ['./elevation-profile-chart.component.scss'],
  imports: [BaseChartDirective],
})
export class ElevationProfileChartComponent implements OnInit {
  @Input() public elevationProfileData!: ElevationProfileData;
  public readonly lineChartData: ElevationProfileChartJsDataConfiguration = {
    datasets: [],
  };
  public readonly lineChartOptions: ElevationProfileChartJsOptions = this.elevationPlotConfigService.getElevationPlotChartOptions();

  constructor(private readonly elevationPlotConfigService: ElevationPlotConfigService) {}

  public ngOnInit() {
    if (this.elevationProfileData.dataPoints.length > 1) {
      this.updateData(this.elevationProfileData.dataPoints, this.elevationProfileData.statistics.linearDistance);
    }
  }

  private updateData(elevationProfileData: ElevationProfileDataPoint[], maxDistance: number) {
    this.lineChartData.datasets.push(
      this.elevationPlotConfigService.createElevationProfileDataset(elevationProfileData, VERTIXAL_AXIS_LABEL),
    );
    this.lineChartOptions.scales.x.max = maxDistance;
  }
}
