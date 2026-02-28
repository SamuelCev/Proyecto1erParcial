class Navbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Obtenemos la ruta base dependiendo de dónde estemos (raíz o dentro de /pages)
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
        const basePath = isRoot ? '' : '../';
        
        // Identificamos la página actual para resaltar el link activo
        const currentPath = window.location.pathname;
        const isInicio = currentPath.endsWith('index.html') || currentPath.endsWith('/');
        const isConfig = currentPath.includes('configuracion.html');
        const isResumen = currentPath.includes('resumen.html');
        const isSorteo = currentPath.includes('sorteo.html');

        // Clases base para el efecto de subrayado animado
        const baseLinkClass = "relative py-1 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100";
        const activeLinkClass = "text-white after:scale-x-100";
        const inactiveLinkClass = "text-brand-400";

        this.innerHTML = `
        <header class="fixed top-0 w-full z-50 glass">
            <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                
                <!-- Logo y Marca -->
                <a href="${basePath}index.html" class="flex items-center gap-3 group">
                    <div class="w-8 h-8 text-white transition-transform group-hover:scale-110">
                        <img
                            src="${basePath}assets/images/nexgift-logo.svg"
                            alt="NexGift Logo"
                            class="w-full h-full object-contain"
                        />
                    </div>
                    <span class="font-semibold text-lg tracking-tight">
                        NexGift<span class="text-brand-400 font-normal ml-1 hidden sm:inline">by D&amp;S</span>
                    </span>
                </a>
                
                <!-- Links Desktop -->
                <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a href="${basePath}index.html" class="${baseLinkClass} ${isInicio ? activeLinkClass : inactiveLinkClass}">
                        Inicio
                    </a>
                    <a href="${basePath}pages/configuracion.html" class="${baseLinkClass} ${isConfig ? activeLinkClass : inactiveLinkClass}">
                        Configurar
                    </a>
                    <a href="${basePath}pages/resumen.html" class="${baseLinkClass} ${isResumen ? activeLinkClass : inactiveLinkClass}">
                        Resumen
                    </a>
                    <a href="${basePath}pages/sorteo.html" class="${baseLinkClass} ${isSorteo ? activeLinkClass : inactiveLinkClass}">
                        Sorteo
                    </a>
                </nav>
                
                <!-- Botón de acción principal (Desktop) -->
                <a href="${basePath}pages/configuracion.html" class="hidden md:flex bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-brand-200 transition-colors">
                    Nuevo Intercambio
                </a>
                
                <!-- Menú Hamburguesa (Mobile) -->
                <button id="mobile-menu-btn" class="md:hidden text-white hover:text-brand-300 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                </button>
            </div>

            <!-- Menú Desplegable (Mobile) -->
            <div id="mobile-menu" class="hidden md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
                <nav class="flex flex-col px-6 py-4 space-y-4 text-sm font-medium">
                    <a href="${basePath}index.html" class="${isInicio ? 'text-white' : 'text-brand-400'}">Inicio</a>
                    <a href="${basePath}pages/configuracion.html" class="${isConfig ? 'text-white' : 'text-brand-400'}">Configurar</a>
                    <a href="${basePath}pages/resumen.html" class="${isResumen ? 'text-white' : 'text-brand-400'}">Resumen</a>
                    <a href="${basePath}pages/sorteo.html" class="${isSorteo ? 'text-white' : 'text-brand-400'}">Sorteo</a>
                </nav>
            </div>
        </header>
        `;

        // Lógica para abrir/cerrar el menú móvil
        const menuBtn = this.querySelector('#mobile-menu-btn');
        const mobileMenu = this.querySelector('#mobile-menu');
        
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Registramos el componente web
customElements.define('app-navbar', Navbar);
