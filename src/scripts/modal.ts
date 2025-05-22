export function initializeModals(): void {
    const modals = document.querySelectorAll('.modal');
    const triggers = document.querySelectorAll('.modal-trigger');
    const closeButtons = document.querySelectorAll('.modal-close');

    const closeModal = (modal: Element) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            if (!modalId) return;
            
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) closeModal(modal);
        });
    });

    modals.forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
}