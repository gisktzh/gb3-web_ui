import {MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {ConfigService} from '../services/config.service';

export function toolTipFactoryLongDelay(configService: ConfigService): MatTooltipDefaultOptions {
  return configService.tooltipConfig.longDelay;
}
