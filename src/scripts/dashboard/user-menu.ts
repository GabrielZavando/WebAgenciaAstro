import { auth } from '../../lib/firebase/client';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { loadNotifications, initNotificationPolling, clearNotificationPolling } from './notifications';

export function initUserMenu() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutDropdownBtn = document.getElementById('logoutDropdownBtn');

  if (userMenuBtn && !userMenuBtn.dataset.initialized) {
    userMenuBtn.dataset.initialized = 'true';
    const userDropdown = document.getElementById('userDropdown');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = userMenuBtn.getAttribute('aria-expanded') === 'true';
      notificationsDropdown?.classList.remove('show');
      notificationsBtn?.setAttribute('aria-expanded', 'false');

      if (isExpanded) {
        userDropdown?.classList.remove('show');
        userMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        userDropdown?.classList.add('show');
        userMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
      window.location.href = '/login'; 
    } catch (error) { 
      console.error('Error cerrando sesión', error); 
    }
  };

  if (logoutBtn && !logoutBtn.dataset.initialized) {
    logoutBtn.dataset.initialized = 'true';
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (logoutDropdownBtn && !logoutDropdownBtn.dataset.initialized) {
    logoutDropdownBtn.dataset.initialized = 'true';
    logoutDropdownBtn.addEventListener('click', handleLogout);
  }

  bindAuthListeners();
}

function updateAuthUI() {
  const user = auth.currentUser;
  if (!user) return;

  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const userAvatar = document.getElementById('userAvatar') as HTMLImageElement;

  if (userNameDisplay) userNameDisplay.textContent = user.displayName || 'Usuario';
  if (userEmailDisplay) userEmailDisplay.textContent = user.email || '';
  if (userAvatar) {
    userAvatar.src = user.photoURL ? user.photoURL : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=random`;
  }
  loadNotifications();
}

function bindAuthListeners() {
  if ((window as any)._authBound) {
     updateAuthUI();
     return;
  }
  (window as any)._authBound = true;
  onAuthStateChanged(auth, (user) => {
    updateAuthUI();
    if (user) {
      initNotificationPolling();
    } else {
      clearNotificationPolling();
    }
  });
}
