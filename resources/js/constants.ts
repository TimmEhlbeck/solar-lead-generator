
import { PanelType, PanelDefinition } from './types';

export const PANEL_DEFINITIONS: Record<PanelType, PanelDefinition> = {
    [PanelType.STANDARD]: {
        widthM: 1.0,
        heightM: 1.7,
        watts: 350
    },
    [PanelType.PREMIUM]: {
        widthM: 1.1,
        heightM: 1.8,
        watts: 450
    },
    [PanelType.COMMERCIAL]: {
        widthM: 1.3,
        heightM: 2.2,
        watts: 600
    }
};
