import { Storage } from '../storage.js';
import { Sorteo } from '../sorteo.js';

/**
 * ui-sorteo.js
 * Controlador para la página sorteo.html
 * Muestra los participantes, ejecuta el sorteo con animación y despliega los resultados.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // REFERENCIAS AL DOM
    // ============================================
    const viewPreSorteo = document.getElementById('view-pre-sorteo');
    const viewAnimacion = document.getElementById('view-animacion');
    const viewResultados = document.getElementById('view-resultados');

    const sorteoEventoNombre = document.getElementById('sorteo-evento-nombre');
    const sorteoNumParticipantes = document.getElementById('sorteo-num-participantes');
    const sorteoNumExclusiones = document.getElementById('sorteo-num-exclusiones');
    const sorteoSubtitle = document.getElementById('sorteo-subtitle');
    const participantesGrid = document.getElementById('sorteo-participantes-grid');
    const btnSortear = document.getElementById('btn-sortear');
    const sorteoError = document.getElementById('sorteo-error');
    const sorteoErrorMsg = document.getElementById('sorteo-error-msg');

    const shuffleNames = document.getElementById('shuffle-names');

    const resultadosGrid = document.getElementById('resultados-grid');
    const resultadosSubtitle = document.getElementById('resultados-subtitle');
    const btnReSortear = document.getElementById('btn-re-sortear');

    // ============================================
    // CARGAR DATOS 
    // ============================================
    function cargarDatos() {
        const data = Storage.leer();

        // Info del evento
        sorteoEventoNombre.textContent = data.evento.nombre || 'Sin nombre';
        sorteoSubtitle.textContent = data.evento.nombre
            ? `Presiona el botón para generar las asignaciones de "${data.evento.nombre}".`
            : 'Presiona el botón para generar las asignaciones aleatorias.';

        // Contadores
        sorteoNumParticipantes.textContent = data.participantes.length;
        let numExcl = 0;
        for (const k in data.exclusiones) {
            numExcl += data.exclusiones[k].length;
        }
        sorteoNumExclusiones.textContent = numExcl;

        // Grid de participantes
        participantesGrid.innerHTML = '';
        data.participantes.forEach((nombre, i) => {
            const badge = document.createElement('div');
            badge.className = 'participante-badge px-4 py-2.5 glass card-border rounded-xl text-sm text-white font-medium flex items-center gap-2';
            badge.style.animationDelay = `${i * 0.05}s`;
            badge.innerHTML = `
                <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-brand-400">${i + 1}</span>
                ${nombre}
            `;
            participantesGrid.appendChild(badge);
        });

        // Validar si se puede sortear
        if (data.participantes.length < 3) {
            btnSortear.querySelector('div:last-child').classList.add('opacity-50', 'pointer-events-none');
            showError('Se necesitan al menos 3 participantes. Ve a Configurar para agregar más.');
        }

        // Si ya hay resultados previos, mostrarlos directamente
        if (data.resultados && data.resultados.length > 0) {
            mostrarResultados(data.resultados, data);
        }
    }

    function showError(msg) {
        sorteoError.classList.remove('!hidden');
        sorteoError.classList.add('flex', 'items-center', 'gap-3');
        sorteoErrorMsg.textContent = msg;
    }

    // ============================================
    // ANIMACIÓN DEL SORTEO
    // ============================================
    function animarSorteo(participantes) {
        return new Promise((resolve) => {
            viewPreSorteo.classList.add('hidden');
            viewAnimacion.classList.remove('hidden');

            let counter = 0;
            const totalCycles = 30; // Cuántos cambios de nombre mostrar
            const baseSpeed = 60;

            const interval = setInterval(() => {
                // Mostrar nombre aleatorio
                const randomIndex = Math.floor(Math.random() * participantes.length);
                shuffleNames.textContent = participantes[randomIndex];

                // Efecto de escala al cambiar
                shuffleNames.style.transform = `scale(${1 + Math.random() * 0.1})`;
                shuffleNames.style.opacity = 0.5 + Math.random() * 0.5;

                counter++;

                if (counter >= totalCycles) {
                    clearInterval(interval);
                    shuffleNames.style.transform = 'scale(1)';
                    shuffleNames.style.opacity = '1';
                    shuffleNames.textContent = '🎉';

                    setTimeout(() => {
                        viewAnimacion.classList.add('hidden');
                        resolve();
                    }, 800);
                }
            }, baseSpeed + counter * 5); // Se ralentiza progresivamente
        });
    }

    // ============================================
    // MOSTRAR RESULTADOS
    // ============================================
    function mostrarResultados(resultados, data) {
        viewPreSorteo.classList.add('hidden');
        viewAnimacion.classList.add('hidden');
        viewResultados.classList.remove('hidden');

        resultadosSubtitle.textContent = data.evento.nombre
            ? `Asignaciones para "${data.evento.nombre}" · ${data.participantes.length} participantes`
            : `${data.participantes.length} participantes asignados`;

        resultadosGrid.innerHTML = '';

        resultados.forEach((par, i) => {
            const card = document.createElement('div');
            card.className = 'resultado-card glass card-border rounded-2xl p-5 flex items-center gap-4 animate-fade-in-up';
            card.style.animationDelay = `${i * 0.1}s`;
            card.style.opacity = '0';
            card.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    ${i + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span class="font-semibold text-white truncate">${par.da}</span>
                        <span class="hidden sm:block text-brand-600">→</span>
                        <span class="sm:hidden text-brand-500 text-xs">le regala a</span>
                        <span class="text-brand-300 truncate">${par.recibe}</span>
                    </div>
                </div>
            `;
            resultadosGrid.appendChild(card);
        });
    }

    // ============================================
    // EVENTOS
    // ============================================
    btnSortear.addEventListener('click', async () => {
        const data = Storage.leer();

        if (data.participantes.length < 3) {
            showError('Se necesitan al menos 3 participantes para hacer el intercambio.');
            return;
        }

        // Ocultar errores previos
        sorteoError.classList.add('!hidden');
        sorteoError.classList.remove('flex', 'items-center', 'gap-3');

        // Animación
        await animarSorteo(data.participantes);

        // Ejecutar algoritmoCO
        const resultado = Sorteo.generar();

        if (resultado.success) {
            const dataActualizada = Storage.leer();
            mostrarResultados(resultado.data, dataActualizada);
        } else {
            // Volver a la vista pre-sorteo con error
            viewPreSorteo.classList.remove('hidden');
            showError(resultado.message);
        }
    });

    btnReSortear.addEventListener('click', () => {
        // Limpiar resultados anteriores
        Storage.guardarResultados([]);
        viewResultados.classList.add('hidden');
        viewPreSorteo.classList.remove('hidden');
        sorteoError.classList.add('!hidden');
        sorteoError.classList.remove('flex', 'items-center', 'gap-3');
        cargarDatos();
    });

    // Botón Nuevo Intercambio - resetear al paso 1
    const btnNuevoIntercambio = document.getElementById('nuevo-intercambio-sorteo-btn');
    if (btnNuevoIntercambio) {
        btnNuevoIntercambio.addEventListener('click', () => {
            sessionStorage.setItem('currentConfigStep', '1');
        });
    }

    // ============================================
    // INIT
    // ============================================
    cargarDatos();
});
