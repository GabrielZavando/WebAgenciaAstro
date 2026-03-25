import { initSidebar } from './sidebar';
import { initUserMenu } from './user-menu';
import { initNotifications } from './notifications';
import { initTheme } from './theme';
import { initUtils } from './utils';

export function initDashboard() {
  initSidebar();
  initTheme();
  initUserMenu();
  initNotifications();
  initUtils();
}

document.addEventListener('astro:page-load', initDashboard);
