class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Obtenemos la ruta base dependiendo de dónde estemos (raíz o dentro de /pages)
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
        const basePath = isRoot ? '' : '../';

        this.innerHTML = `
        <footer class="border-t border-white/10 py-8 text-center text-sm text-brand-500 bg-black/50 backdrop-blur-md">
            <div class="flex flex-col items-center justify-center gap-2">
                <div class="flex items-center gap-2">
                    <span>NexGift &copy; 2026</span>
                    <span class="text-brand-700">&mdash;</span>
                    <span class="flex items-center gap-1.5">
                        Creado por 
                        <img src="${basePath}assets/images/d&s-logo.svg" alt="D&S Logo" class="w-6 h-6 inline-block opacity-80" />
                        <span class="font-semibold text-brand-300">D&S</span>
                    </span>
                </div>
                <p class="font-light text-brand-600">
                    Universidad Autónoma de Aguascalientes &middot; Tecnologías Web
                </p>
            </div>
        </footer>
        `;
    }
}

// Registramos el componente web
customElements.define('app-footer', Footer);
