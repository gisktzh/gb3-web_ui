import {MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {ConfigService} from '../services/config.service';

export function toolTipFactoryMapToolsAndControls(configService: ConfigService): MatTooltipDefaultOptions {
  return configService.tooltipConfig.mapToolsAndControls;
}
