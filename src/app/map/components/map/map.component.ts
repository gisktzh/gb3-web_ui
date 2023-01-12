import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';
import {Store} from '@ngrx/store';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mainMap', {static: true}) mainMapRef!: ElementRef;

  constructor(private readonly mapService: MapService, private store: Store) {}

  public ngOnInit() {
    this.mapService.init();
  }

  public ngAfterViewInit() {
    this.mapService.assignMapElement(this.mainMapRef.nativeElement);
  }
}
