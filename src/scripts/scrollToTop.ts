export interface ScrollButton extends HTMLButtonElement {
    classList: DOMTokenList;
}

export class ScrollToTop {
    private button: ScrollButton | null;
    private readonly threshold: number;

    constructor(threshold: number = 200) {
        this.button = document.querySelector<ScrollButton>('.scroll-top');
        this.threshold = threshold;
        this.init();
    }

    private init(): void {
        if (!this.button) return;

        window.addEventListener('scroll', this.toggleButtonVisibility.bind(this));
        this.button.addEventListener('click', this.scrollToTop.bind(this));
    }

    private toggleButtonVisibility(): void {
        if (!this.button) return;

        const shouldShow = window.scrollY > this.threshold;
        this.button.classList.toggle('visible', shouldShow);
    }

    private scrollToTop(): void {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}