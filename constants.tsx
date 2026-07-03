/**
 * Global Constants for Melotwo Mine Safety Audit Engine
 */

import * as Icons from './components/icons';
import { Page } from './types';

export const APP_NAME = 'Melotwo Compliant Mine Safety Audit Engine';

export interface NavigationItem {
  label: string;
  page: Page;
  icon: keyof typeof Icons;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', page: 'home', icon: 'Activity' },
  { label: 'Solutions', page: 'solutions', icon: 'Shield' },
  { label: 'Inspector', page: 'inspector', icon: 'AlertTriangle' }
];
