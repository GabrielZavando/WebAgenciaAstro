export function initAccordion(): void {
  const cards = document.querySelectorAll<HTMLElement>('.phase-card')
  
  if (cards.length === 0) return

  cards.forEach((card: HTMLElement) => {
    const header = card.querySelector<HTMLElement>('.phase-card__header')
    if (header) {
      // Usar onclick para evitar duplicados si el script se re-ejecuta 
      // con View Transitions
      header.onclick = () => {
        const isOpen = card.classList.contains('is-open')
        
        // Cerrar todas (comportamiento de accordion exclusivo)
        cards.forEach((c: HTMLElement) => c.classList.remove('is-open'))
        
        if (!isOpen) {
          card.classList.add('is-open')
        }

        // Actualizar textos de todos los botones
        cards.forEach((c: HTMLElement) => {
          const textSpan = c.querySelector('.toggle-text')
          if (textSpan) {
            textSpan.textContent = c.classList.contains('is-open') ? 'contraer' : 'expandir'
          }
        })
      }
    }
  })
}
