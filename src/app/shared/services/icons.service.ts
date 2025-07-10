import {Injectable, inject} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {iconsConfig} from '../configs/icons.config';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  private readonly matIconRegistry = inject(MatIconRegistry);
  private readonly domSanitizer = inject(DomSanitizer);

  public initIcons() {
    iconsConfig.forEach((config) => {
      this.matIconRegistry.addSvgIcon(config.id, this.domSanitizer.bypassSecurityTrustResourceUrl(config.path));
    });
  }
}
