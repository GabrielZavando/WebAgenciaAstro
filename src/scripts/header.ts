interface HeaderElements {
    navToggle: HTMLButtonElement | null;
    nav: HTMLElement | null;
    hamburger: HTMLElement | null;
    header: HTMLElement | null;
    navLinks: NodeListOf<HTMLAnchorElement>;
}

export class Header {
    private elements: HeaderElements;
    private lastScrollTop: number;
    private readonly scrollThreshold: number;

    constructor() {
        this.elements = {
            navToggle: document.querySelector('.nav-toggle'),
            nav: document.querySelector('.nav'),
            hamburger: document.querySelector('.hamburger'),
            header: document.querySelector('.header'),
            navLinks: document.querySelectorAll('.nav__link')
        };
        this.lastScrollTop = 0;
        this.scrollThreshold = 50;
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Event listener para el botón de menú
        this.elements.navToggle?.addEventListener('click', () => this.toggleMenu());

        // Event listeners para los enlaces del menú
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Event listener para el scroll
        window.addEventListener('scroll', () => this.handleScroll());
    }

    private toggleMenu(): void {
        this.elements.nav?.classList.toggle('active');
        this.elements.hamburger?.classList.toggle('active');
    }

    private closeMenu(): void {
        this.elements.nav?.classList.remove('active');
        this.elements.hamburger?.classList.remove('active');
    }

    private handleScroll(): void {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > this.scrollThreshold) {
            this.elements.header?.classList.add('scrolled');
        } else {
            this.elements.header?.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
}
