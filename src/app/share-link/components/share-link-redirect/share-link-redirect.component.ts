import {Component, OnInit} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {ShareLinkConstants} from '../../../shared/constants/share-link.constants';
import {ShareLinkService} from '../../services/share-link.service';

@Component({
  selector: 'share-link-redirect',
  templateUrl: './share-link-redirect.component.html',
  styleUrls: ['./share-link-redirect.component.scss'],
})
export class ShareLinkRedirectComponent implements OnInit {
  // expose the enum to the HTML
  public readonly mainPageEnum = MainPage;
  public id: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly shareLinkService: ShareLinkService,
  ) {}

  public ngOnInit() {
    this.id = this.route.snapshot.paramMap.get(ShareLinkConstants.SHARE_LINK_ID_PARAMETER_NAME);
    if (this.id !== null) {
      this.shareLinkService.initializeApplication(this.id);
    }
  }
}
