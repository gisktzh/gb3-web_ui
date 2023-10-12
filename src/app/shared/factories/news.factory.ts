import {ConfigService} from '../services/config.service';
import {serviceFactory} from './service.factory';

export function newsFactory<T>(service: T, mockService: T, configService: ConfigService): T {
  return serviceFactory(service, mockService, configService.apiConfig.ktzhWebsite.useMockData);
}
