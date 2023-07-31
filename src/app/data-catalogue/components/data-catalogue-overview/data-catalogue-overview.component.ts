import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';

@Component({
  selector: 'data-catalogue-overview',
  templateUrl: './data-catalogue-overview.component.html',
  styleUrls: ['./data-catalogue-overview.component.scss'],
})
export class DataCatalogueOverviewComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly gb3MetadataService: Gb3MetadataService) {}

  public ngOnInit() {
    this.subscriptions.add(this.gb3MetadataService.loadFullList().subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
