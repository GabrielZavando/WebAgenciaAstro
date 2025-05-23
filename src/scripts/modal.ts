interface ModalElements {
    modals: NodeListOf<HTMLElement>;
    triggers: NodeListOf<HTMLButtonElement>;
    closeButtons: NodeListOf<HTMLButtonElement>;
}

export function initializeModals(): void {
    console.log('Inicializando sistema de modales...'); // Debug

    const elements: ModalElements = {
        modals: document.querySelectorAll('.modal'),
        triggers: document.querySelectorAll('.service-card__button'),
        closeButtons: document.querySelectorAll('.modal__close')
    };

    console.log('Elementos encontrados:', {
        modals: elements.modals.length,
        triggers: elements.triggers.length,
        closeButtons: elements.closeButtons.length
    });

    const closeModal = (modal: HTMLElement): void => {
        console.log('Cerrando modal'); // Debug
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const openModal = (modalId: string): void => {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal con ID ${modalId} no encontrado`);
            return;
        }

        console.log(`Abriendo modal ${modalId}`); // Debug
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Event Listeners
    elements.triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            console.log('Click en trigger, modalId:', modalId); // Debug
            if (modalId) openModal(modalId);
        });
    });

    elements.closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal') as HTMLElement;
            if (modal) closeModal(modal);
        });
    });

    // Cierre al hacer click fuera del modal
    elements.modals.forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Cierre con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active') as HTMLElement;
            if (activeModal) closeModal(activeModal);
        }
    });
}