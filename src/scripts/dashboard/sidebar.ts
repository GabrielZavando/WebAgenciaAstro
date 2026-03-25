export function initSidebar() {
  // Lógica de Items Activos
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item') as NodeListOf<HTMLElement>;
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (!href) return;

    const isExactMatch = currentPath === href;
    const isSubPathMatch = href !== '/admin' && href !== '/dashboard' && href !== '/' && currentPath.startsWith(href) && !item.classList.contains('nav-item-toggle');

    if (isExactMatch || isSubPathMatch) {
      item.style.color = 'var(--color-primary)';
      item.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
      item.style.fontWeight = '600';
      
      const parentSubmenu = item.closest('.nav-submenu');
      if (parentSubmenu) {
        parentSubmenu.classList.add('open');
        const toggle = parentSubmenu.previousElementSibling;
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
      }
    } else {
      item.style.color = '';
      item.style.backgroundColor = '';
      item.style.fontWeight = '';
    }
  });

  // Toggles de submenus
  if (!(window as any)._toggleBound) {
    (window as any)._toggleBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const toggle = target.closest('.nav-item-toggle');
      if (toggle) {
        e.preventDefault();
        const submenu = toggle.nextElementSibling as HTMLElement;
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        submenu?.classList.toggle('open');
      }
    });
  }

  const sidebar = document.getElementById('main-sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');

  // Sidebar mobile toggle
  if (sidebarToggle && !sidebarToggle.dataset.initialized) {
    sidebarToggle.dataset.initialized = 'true';
    sidebarToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });
  }

  // Sidebar desktop collapse
  if (collapseBtn && !collapseBtn.dataset.initialized) {
    collapseBtn.dataset.initialized = 'true';
    const icon = collapseBtn.querySelector('.material-symbols-outlined');
    
    collapseBtn.addEventListener('click', () => {
      sidebar?.classList.toggle('collapsed');
      const nowCollapsed = sidebar?.classList.contains('collapsed');
      localStorage.setItem('sidebar-collapsed', String(nowCollapsed));
      if (icon) {
        icon.textContent = nowCollapsed ? 'chevron_right' : 'chevron_left';
      }
    });
  }

  // Set initial collapse state
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
  if (isCollapsed && sidebar) {
    sidebar.classList.add('collapsed');
    const icon = collapseBtn?.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'chevron_right';
  }
}
