import {Component, Input} from '@angular/core';
import {ElevationProfileStatistics} from '../../../../shared/interfaces/elevation-profile.interface';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'elevation-profile-statistics',
  templateUrl: './elevation-profile-statistics.component.html',
  styleUrls: ['./elevation-profile-statistics.component.scss'],
  imports: [DecimalPipe],
})
export class ElevationProfileStatisticsComponent {
  @Input() public statistics!: ElevationProfileStatistics;
}
