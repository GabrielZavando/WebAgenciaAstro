const getTurnstileSiteKey = () => import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
const getApiUrl = () => import.meta.env.PUBLIC_API_URL || "http://localhost:8080";

interface Question {
  id: string;
  text: string;
  pilar: string;
}

interface AssessmentResult {
  score: number;
  level: string;
  name: string;
  description: string;
  recommendations: string[];
}

const QUESTIONS: Question[] = [
  { id: "q1", text: "¿Tienes un documento donde se defina claramente tu marca (nombre, colores, tono de comunicación y propuesta de valor)?", pilar: "Personas" },
  { id: "q2", text: "¿Existe un espacio definido (aunque sea mínimo) para aprender o mejorar el uso de herramientas digitales?", pilar: "Personas" },
  { id: "q3", text: "¿Cada persona del equipo tiene claramente definido su rol dentro de los procesos del negocio?", pilar: "Personas" },
  
  { id: "q4", text: "¿Tienes definido y documentado cómo llegan los clientes y qué pasos sigues para atenderlos?", pilar: "Procesos" },
  { id: "q5", text: "¿Existe un método estándar para enviar cotizaciones y hacer seguimiento a potenciales clientes?", pilar: "Procesos" },
  { id: "q6", text: "¿Está definido qué ocurre después de la venta para asegurar satisfacción del cliente?", pilar: "Procesos" },
  
  { id: "q7", text: "¿Eres dueño de tus activos digitales (dominio, sitio web, correos corporativos)?", pilar: "Tecnología" },
  { id: "q8", text: "¿Registras tus clientes y sus interacciones en una herramienta centralizada?", pilar: "Tecnología" },
  { id: "q9", text: "¿Tu información importante está disponible online y cuenta con respaldos?", pilar: "Tecnología" },
  
  { id: "q10", text: "¿Llevas control digital actualizado de ingresos, gastos y márgenes?", pilar: "Datos" },
  { id: "q11", text: "¿Mides cuántos clientes contactas y cuántos compran?", pilar: "Datos" },
  { id: "q12", text: "¿Has tomado decisiones recientes basadas en datos concretos?", pilar: "Datos" }
];

const LEVELS = {
  INI: { name: "Nivel Inicial", emoji: "🌱", description: "Tu negocio está dando sus primeros pasos en el mundo digital. Hay una gran oportunidad para automatizar procesos y atraer más clientes." },
  INT: { name: "Nivel Intermedio", emoji: "🚀", description: "Ya tienes una base digital establecida. Ahora el reto es optimizar la conversión y escalar tus operaciones." },
  ADV: { name: "Nivel Avanzado", emoji: "💎", description: "¡Felicidades! Tu negocio tiene una madurez digital sólida. El siguiente paso es la hiper-personalización y el uso avanzado de IA." }
};

const PILAR_ICONS: Record<string, string> = {
  "Personas": "👨‍💻",
  "Procesos": "⚙️",
  "Tecnología": "💻",
  "Datos": "📊"
};

class AssessmentForm extends HTMLElement {
  private step: "intro" | "quiz" | "contact" | "result" = "intro";
  private currentPilarIndex = 0;
  private answers: Record<string, boolean> = {};
  private pilars = ["Personas", "Procesos", "Tecnología", "Datos"];
  private loading = false;
  private result: AssessmentResult | null = null;
  private turnstileWidgetId: string | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  private nextStep() {
    if (this.step === "intro") {
      this.step = "quiz";
      // Disparamos evento para que el padre oculte el header
      this.dispatchEvent(new CustomEvent('assessment-start', {
        bubbles: true,
        composed: true
      }));
    } else if (this.step === "quiz") {
      if (this.currentPilarIndex < this.pilars.length - 1) {
        this.currentPilarIndex++;
      } else {
        this.step = "contact";
      }
    }
    this.render();
    this.scrollToTop();
  }

  private prevStep() {
    if (this.step === "quiz") {
      if (this.currentPilarIndex > 0) {
        this.currentPilarIndex--;
      } else {
        this.step = "intro";
      }
    } else if (this.step === "contact") {
      this.step = "quiz";
      this.currentPilarIndex = this.pilars.length - 1;
    }
    this.render();
    this.scrollToTop();
  }

  private handleAnswer(questionId: string, value: boolean) {
    this.answers[questionId] = value;
    this.render();
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (this.loading) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Capturamos el token de Turnstile de forma robusta
    const turnstileToken = formData.get("cf-turnstile-response")?.toString() || 
                          (form.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement)?.value;

    if (!turnstileToken) {
        alert("Por favor, completa el captcha de seguridad para continuar.");
        return;
    }

    // Convertimos las respuestas de objeto a arreglo ordenado para la API
    const answersArray = QUESTIONS.map(q => !!this.answers[q.id]);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      industry: formData.get("sector"), // Mapear 'sector' a 'industry' según DTO
      answers: answersArray,           // Enviar como arreglo de booleanos
      turnstileToken: turnstileToken
    };

    this.loading = true;
    this.render();

    try {
      const response = await fetch(`${getApiUrl()}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Error al procesar el diagnóstico");
      }
      
      this.result = await response.json();
      this.step = "result";
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "Hubo un error al procesar tu diagnóstico. Por favor intenta de nuevo.");
    } finally {
      this.loading = false;
      this.render();
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private render() {
    this.innerHTML = "";
    const container = document.createElement("div");
    container.className = "aform aform--card";

    switch (this.step) {
      case "intro":
        container.innerHTML = this.renderIntro();
        break;
      case "quiz":
        container.innerHTML = this.renderQuiz();
        break;
      case "contact":
        container.innerHTML = this.renderContact();
        break;
      case "result":
        container.innerHTML = this.renderResult();
        break;
    }

    this.appendChild(container);
    this.attachEvents();
    
    // Iniciar captcha después de añadir al DOM si estamos en el paso de contacto
    if (this.step === "contact") {
      this.initTurnstile();
    }
  }

  private renderIntro() {
    return `
      <div class="aform__intro-content">
        <div class="aform__hero-badge">
          <span class="aform__badge-dot"></span>
          Versión 2026
        </div>
        
        <h3 class="aform__title-small">Diagnóstico de Madurez Digital</h3>
        
        <p class="aform__subtitle">
          Analiza 12 puntos clave y recibe una hoja de ruta estratégica para digitalizar tu empresa.
        </p>

        <section class="aform__instructions">
          <div class="aform__instructions-quote">
            <p>Esta autoevaluación te permitirá entender el nivel real de digitalización de tu negocio.</p>
            
            <p>Debes responder cada pregunta con <strong>"Sí"</strong> solo si puedes demostrarlo con evidencia concreta (documento, planilla, sistema, procedimiento escrito).</p>
            
            <p>Si algo lo haces de manera informal, de memoria o sin respaldo, debes responder <strong>"No"</strong>.</p>
          </div>

          <div class="aform__rules">
            <h4>Reglas de respuesta:</h4>
            <ul class="aform__rules-ul">
              <li>Cada "Sí" equivale a 1 punto</li>
              <li>Cada "No" equivale a 0 puntos</li>
              <li>No existen respuestas correctas o incorrectas, solo respuestas honestas</li>
              <li>La evaluación debe reflejar la realidad actual, no intenciones futuras.</li>
            </ul>
          </div>
        </section>

        <div class="aform__btn-container-right">
          <button class="btn-cta aform__btn-start" id="btn-start">
            Comenzar Diagnóstico Gratis
          </button>
        </div>
      </div>
    `;
  }

  private renderQuiz() {
    const pilar = this.pilars[this.currentPilarIndex];
    const questions = QUESTIONS.filter(q => q.pilar === pilar);
    const totalAnswered = Object.keys(this.answers).length;
    const progress = Math.round((totalAnswered / QUESTIONS.length) * 100);

    return `
      <div class="aform__pilar-header">
        <div class="aform__pilar-icon">${PILAR_ICONS[pilar]}</div>
        <div class="aform__pilar-info">
          <div class="aform__pilar-sup">${pilar}</div>
          <h3 class="aform__title">${this.getPilarTitle(pilar)}</h3>
        </div>
      </div>

      <div class="aform__questions">
        ${questions.map((q, idx) => {
          const absoluteIdx = QUESTIONS.indexOf(q) + 1;
          const answered = this.answers[q.id] !== undefined;
          return `
            <div class="aform__question ${answered ? 'aform__question--answered' : ''}">
              <p class="aform__question-text">
                <span class="aform__question-num">${absoluteIdx}</span>
                ${q.text}
              </p>
              <div class="aform__yn-group">
                <button type="button" class="aform__yn ${this.answers[q.id] === true ? 'aform__yn--yes-active' : ''}" data-qid="${q.id}" data-val="true">
                  <span class="material-symbols-outlined">check_circle</span>
                  Sí
                </button>
                <button type="button" class="aform__yn ${this.answers[q.id] === false ? 'aform__yn--no-active' : ''}" data-qid="${q.id}" data-val="false">
                  <span class="material-symbols-outlined">cancel</span>
                  No
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="aform__nav">
        <button class="btn-cta__border" id="btn-prev">
          <span class="material-symbols-outlined" style="color: white">arrow_back</span>
          Anterior
        </button>
        <button class="btn-cta ${this.isPilarComplete(pilar) ? '' : 'btn--disabled'}" id="btn-next" ${this.isPilarComplete(pilar) ? "" : "disabled"}>
          ${this.currentPilarIndex === this.pilars.length - 1 ? "Ver Resultados" : "Continuar"}
          <span class="material-symbols-outlined" style="color: white">arrow_forward</span>
        </button>
      </div>

      <div class="aform__progress-footer">
        <div class="aform__progress-bar-container">
          <div class="aform__progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="aform__progress-label">Progreso del Diagnóstico — ${progress}% completado</div>
      </div>
    `;
  }

  private renderContact() {
    const score = Object.values(this.answers).filter(v => v).length;
    return `
      <div class="aform__contact-grid">
        <div class="aform__contact-info">
          <div class="aform__contact-score">
            <span class="aform__contact-score-num">${score}/12</span>
            <span class="aform__contact-score-label">Puntos de Madurez</span>
          </div>
          <h3 class="aform__title">🎉 Tus resultados están listos</h3>
          <p class="aform__subtitle">
            Ingresa tus datos para recibir el reporte estratégico en PDF directamente en tu bandeja de entrada.
          </p>
        </div>

        <form class="aform__contact-form" id="contact-form">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" name="name" class="form-input" placeholder="Nombre completo" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <input type="email" name="email" class="form-input" placeholder="tucorreo@ejemplo.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Empresa</label>
            <input type="text" name="company" class="form-input" placeholder="nombre de la empresa" required />
          </div>

          <div class="form-group">
            <label class="form-label">Sector industrial</label>
            <div class="select-wrapper">
              <select name="sector" class="form-select" required>
                <option value="" disabled selected>seleccione un sector industrial</option>
                <option value="retail">Comercio</option>
                <option value="servicios">Servicios</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="tecnologia">Tecnología</option>
                <option value="otros">Otro</option>
              </select>
            </div>
          </div>

          <div id="turnstile-container" class="aform__turnstile"></div>

          <div class="aform__nav">
            <button type="button" class="btn-cta__border" id="btn-prev" style="min-width: 150px">
              <span class="material-symbols-outlined" style="color: white">arrow_back</span>
              Anterior
            </button>
            <button type="submit" class="btn-cta ${this.loading ? 'btn-loading' : ''}" ${this.loading ? "disabled" : ""} style="min-width: 250px">
              ${this.loading ? "" : "Finalizar Diagnóstico"}
              ${this.loading ? "" : '<span class="material-symbols-outlined" style="color: white">arrow_forward</span>'}
            </button>
          </div>
        </form>
      </div>

      <div class="aform__progress-footer">
        <div class="aform__progress-bar-container">
          <div class="aform__progress-bar" style="width: 100%"></div>
        </div>
        <div class="aform__progress-label">Fase final — 100% completado</div>
      </div>
    `;
  }

  private renderResult() {
    return `
      <div class="aform__success">
        <div class="aform__success-icon">
          <span class="material-symbols-outlined">mark_email_read</span>
        </div>

        <h2 class="aform__success-title">¡Diagnóstico enviado con éxito!</h2>

        <p class="aform__success-subtitle">
          Gracias por completar la autoevaluación. Hemos recibido tus respuestas
          y en breve recibirás en tu correo:
        </p>

        <ul class="aform__success-list">
          <li>
            <span class="material-symbols-outlined">description</span>
            Tu diagnóstico digital completo
          </li>
          <li>
            <span class="material-symbols-outlined">map</span>
            La hoja de ruta estratégica para avanzar en la digitalización de tu empresa
          </li>
        </ul>

        <div class="aform__success-notice">
          <span class="material-symbols-outlined">inbox</span>
          Revisa tu bandeja de entrada — y también la carpeta de spam por si acaso.
        </div>

        <div class="aform__success-cta">
          <p>¿Quieres acelerar tu transformación digital con ayuda experta?</p>
          <a
            href="https://calendar.app.google/HbTU9z3qgBWTUzkK7"
            target="_blank"
            class="btn-cta"
            style="min-width: 340px"
          >
            <span class="material-symbols-outlined" style="color: white">calendar_month</span>
            Agenda una sesión estratégica gratis
          </a>
        </div>
      </div>
    `;
  }

  private getPilarTitle(pilar: string) {
    const titles: Record<string, string> = {
      "Personas": "Personas y Cultura",
      "Procesos": "Procesos (Forma de operar)",
      "Tecnología": "Tecnología (Herramientas)",
      "Datos": "Datos (Toma de decisiones)"
    };
    return titles[pilar];
  }

  private isPilarComplete(pilar: string) {
    const questions = QUESTIONS.filter(q => q.pilar === pilar);
    return questions.every(q => this.answers[q.id] !== undefined);
  }

  private attachEvents() {
    const btnStart = this.querySelector("#btn-start");
    if (btnStart) btnStart.addEventListener("click", () => this.nextStep());

    const btnNext = this.querySelector("#btn-next");
    if (btnNext) btnNext.addEventListener("click", () => this.nextStep());

    const btnPrev = this.querySelector("#btn-prev");
    if (btnPrev) btnPrev.addEventListener("click", () => this.prevStep());

    const ynButtons = this.querySelectorAll(".aform__yn");
    ynButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const qid = target.dataset.qid!;
        const val = target.dataset.val === "true";
        this.handleAnswer(qid, val);
      });
    });

    const form = this.querySelector("#contact-form");
    if (form) form.addEventListener("submit", (e) => this.handleSubmit(e as SubmitEvent));
  }

  private initTurnstile() {
    const container = this.querySelector("#turnstile-container") as HTMLElement;
    if (!container) return;

    if ((window as any).turnstile) {
        // Limpiamos cualquier widget previo
        if (this.turnstileWidgetId) {
            try {
                (window as any).turnstile.remove(this.turnstileWidgetId);
            } catch (e) {}
        }

        const siteKey = getTurnstileSiteKey();
        if (!siteKey) {
            console.error("Turnstile Site Key missing");
            container.innerHTML = "<p style='color:red;font-size:12px'>Error de configuración: Captcha deshabilitado</p>";
            return;
        }

        this.turnstileWidgetId = (window as any).turnstile.render(container, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => {
                console.log(`Captcha validado`);
            },
            "error-callback": (err: any) => {
              console.error("Turnstile Error:", err);
            }
        });
    } else {
        setTimeout(() => this.initTurnstile(), 500);
    }
  }
}

customElements.define("assessment-form", AssessmentForm);
