// Crear nuevo archivo: src/scripts/smoothScroll.ts
export class SmoothScroll {
    constructor() {
        this.init();
    }

    private init(): void {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href') || '');
                
                if (target) {
                    // Obtener la altura del header
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.getBoundingClientRect().height : 0;
                    
                    // Calcular la posición considerando el header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}