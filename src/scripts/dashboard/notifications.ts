import { auth } from '../../lib/firebase/client';
import { apiClient } from '../../lib/api-client';

let notifPoller: number | null = null;

export function initNotifications() {
  const notificationsBtn = document.getElementById('notificationsBtn');

  if (notificationsBtn && !notificationsBtn.dataset.initialized) {
    notificationsBtn.dataset.initialized = 'true';
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = notificationsBtn.getAttribute('aria-expanded') === 'true';
      userDropdown?.classList.remove('show');
      userMenuBtn?.setAttribute('aria-expanded', 'false');

      if (isExpanded) {
        notificationsDropdown?.classList.remove('show');
        notificationsBtn.setAttribute('aria-expanded', 'false');
      } else {
        notificationsDropdown?.classList.add('show');
        notificationsBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }
}

export async function loadNotifications() {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    // Use centralized apiClient
    const dt = await apiClient.get<any[]>('notifications', { token });
    renderNotifications(dt);
  } catch (e) {
    console.error('Error fetching notifications:', e);
  }
}

function renderNotifications(notifications: any[]) {
  const notificationsList = document.getElementById('notificationsList');
  const notificationBadge = document.getElementById('notificationBadge');
  if (!notificationsList) return;

  const unreadNotifications = notifications.filter((n: any) => !n.read);
  if (unreadNotifications.length === 0) {
    notificationsList.innerHTML = '<div class="notification-empty text-muted" style="padding: 1.5rem; text-align: center;">No tienes notificaciones pendientes.</div>';
    if (notificationBadge) {
      notificationBadge.style.display = 'none';
      notificationBadge.textContent = '0';
    }
    return;
  }

  if (notificationBadge) {
    notificationBadge.textContent = unreadNotifications.length > 99 ? '99+' : String(unreadNotifications.length);
    notificationBadge.style.display = 'flex';
  }

  notificationsList.innerHTML = unreadNotifications.map((notif: any) => {
    let timestamp = notif.createdAt;
    if (notif.createdAt && notif.createdAt._seconds) timestamp = notif.createdAt._seconds * 1000;
    const d = new Date(timestamp);
    const displayMessage = notif.message.length > 45 ? notif.message.substring(0, 42) + '...' : notif.message;
    return `<li class="notifications-dropdown__item unread" data-id="${notif.id}" data-link="${notif.link || '#'}">
      <span class="nt-title">${notif.title}</span>
      <p class="nt-content">${displayMessage}</p>
      <div class="nt-date">${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    </li>`;
  }).join('');

  notificationsList.querySelectorAll('.notifications-dropdown__item').forEach(item => {
    item.addEventListener('click', async () => {
      const id = item.getAttribute('data-id');
      const link = item.getAttribute('data-link');
      
      try {
        const token = await auth.currentUser?.getIdToken();
        // Use apiClient correctly
        await apiClient.patch(`notifications/${id}/read`, {}, { token });

        if (link && link !== '#' && link !== window.location.pathname) {
          window.location.href = link;
        }

        item.remove();
        
        const remainingCount = notificationsList.querySelectorAll('.notifications-dropdown__item').length;
        if (notificationBadge) {
          if (remainingCount > 0) {
            notificationBadge.textContent = remainingCount > 99 ? '99+' : String(remainingCount);
            notificationBadge.style.display = 'flex';
          } else {
            notificationBadge.style.display = 'none';
            notificationBadge.textContent = '0';
            notificationsList.innerHTML = '<div class="notification-empty text-muted" style="padding: 1.5rem; text-align: center;">No tienes notificaciones pendientes.</div>';
          }
        }
      } catch (err) { 
        console.error('Error marking notification as read:', err); 
      }
    });
  });
}

export function initNotificationPolling() {
  if (notifPoller === null) {
    notifPoller = window.setInterval(loadNotifications, 60000);
  }
}

export function clearNotificationPolling() {
  if (notifPoller !== null) {
    clearInterval(notifPoller);
    notifPoller = null;
  }
}
