export interface PlanPrices {
    monthly: number;
    quarterly: number;
    yearly: number;
}

export interface Plan {
    name: string;
    description: string;
    features: {
        feature: string;
        included: boolean;
    }[];
    prices: PlanPrices;
    popular?: boolean;
}

// Función para actualizar precios que se ejecutará en el cliente
export const updatePlanPricing = () => {
    const toggleInput = document.querySelector('.toggle__input') as HTMLInputElement;
    const priceElements = document.querySelectorAll('.price__amount');
    const periodLabels = document.querySelectorAll('.price__period');
    const leftLabel = document.querySelector('.toggle__label--left');
    const rightLabel = document.querySelector('.toggle__label--right');

    const updateLabels = (isYearly: boolean) => {
        leftLabel?.classList.toggle('active', !isYearly);
        rightLabel?.classList.toggle('active', isYearly);
    };

    // Inicializar estado
    updateLabels(false);

    toggleInput?.addEventListener('change', () => {
        const isYearly = toggleInput.checked;
        const selectedPeriod = isYearly ? 'yearly' : 'quarterly';

        // Actualizar precios
        priceElements.forEach((element, index) => {
            const plan = window.plans[index];
            if (plan?.prices) {
                const price = plan.prices[selectedPeriod as keyof PlanPrices];
                element.textContent = `$${price}`;
            }
        });

        // Actualizar etiquetas de período
        const periodText = isYearly ? '/año' : '/trimestre';
        periodLabels.forEach(label => {
            label.textContent = periodText;
        });

        // Actualizar estilo de las etiquetas
        updateLabels(isYearly);
    });
};