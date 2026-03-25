// Global Select Icon Rotation Logic
export function bindSelectRotation(sel: HTMLSelectElement) {
  if (sel.dataset.rotationBound) return;
  sel.dataset.rotationBound = 'true';

  const wrapper = sel.closest<HTMLElement>('.input-with-icon, .select-wrapper');
  if (!wrapper) return;

  // Mark as open on mousedown — fires before the native dropdown
  sel.addEventListener('mousedown', () => {
    wrapper.classList.toggle('is-open');
  });

  // Always close on blur (handles change & external click)
  sel.addEventListener('blur', () => {
    wrapper.classList.remove('is-open');
  });
}

export function bindAllSelects() {
  document.querySelectorAll<HTMLSelectElement>('.input-with-icon select, .select-wrapper select')
    .forEach(bindSelectRotation);
}

export function initUtils() {
  const fadeElements = document.querySelectorAll('.fade-in');
  setTimeout(() => { fadeElements.forEach(el => el.classList.add('animate')); }, 50);
  bindAllSelects();

  if (!(window as any)._selectObserver) {
    (window as any)._selectObserver = new MutationObserver(() => bindAllSelects());
    (window as any)._selectObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Global click bound setup for dropdowns
  if (!(window as any)._globalClickBound) {
    (window as any)._globalClickBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      const userDropdown = document.getElementById('userDropdown');
      const userMenuBtn = document.getElementById('userMenuBtn');
      if (userDropdown && userMenuBtn && !target.closest('.user-menu-container')) {
        userDropdown.classList.remove('show');
        userMenuBtn.setAttribute('aria-expanded', 'false');
      }

      const notificationsDropdown = document.getElementById('notificationsDropdown');
      const notificationsBtn = document.getElementById('notificationsBtn');
      if (notificationsDropdown && notificationsBtn && !target.closest('.notifications-container')) {
        notificationsDropdown.classList.remove('show');
        notificationsBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
