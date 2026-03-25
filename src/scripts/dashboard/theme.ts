export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle && !themeToggle.dataset.initialized) {
    themeToggle.dataset.initialized = 'true';
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}
