import {Component, Input} from '@angular/core';
import {ElevationProfileStatistics} from '../../../../shared/interfaces/elevation-profile.interface';

@Component({
  selector: 'elevation-profile-statistics',
  templateUrl: './elevation-profile-statistics.component.html',
  styleUrls: ['./elevation-profile-statistics.component.scss'],
})
export class ElevationProfileStatisticsComponent {
  @Input() public statistics!: ElevationProfileStatistics;
}
