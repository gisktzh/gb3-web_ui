import {Router} from '@angular/router';
import {EmbeddedErrorHandlerService} from 'src/app/embedded-page/services/embedded-error-handler.service';
import {ErrorHandlerService} from 'src/app/error-handling/error-handler.service';
import {MainPage} from '../enums/main-page.enum';
import {UrlUtils} from '../utils/url.utils';

export function errorHandlerServiceFactory(
  router: Router,
  errorHandlerService: ErrorHandlerService,
  embeddedErrorHandlerService: EmbeddedErrorHandlerService,
) {
  const urlTree = router.parseUrl(window.location.pathname);
  const mainPage = UrlUtils.extractMainPage(urlTree);
  if (mainPage === MainPage.Embedded) {
    return embeddedErrorHandlerService;
  } else {
    return errorHandlerService;
  }
}
