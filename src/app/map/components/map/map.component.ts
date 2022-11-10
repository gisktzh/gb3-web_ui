import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;

  constructor(private readonly mapService: MapService) {}

  public ngOnInit() {
    this.mapService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }
}
