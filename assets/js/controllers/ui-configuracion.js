import { Storage } from '../storage.js';
import { Model } from '../model.js';

/**
 * ui-configuracion.js
 * Controlador para la página de configuracion.html
 * Maneja un wizard multi-paso para configurar un intercambio.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // ESTADO LOCAL
    // ============================================
    let currentStep = 1;
    const TOTAL_STEPS = 6;

    // ============================================
    // REFERENCIAS AL DOM
    // ============================================
    const steps = {};
    for (let i = 1; i <= TOTAL_STEPS; i++) {
        steps[i] = document.getElementById(`step-${i}`);
    }

    const progressBar = document.getElementById('progress-bar');
    const stepLabel = document.getElementById('step-label');
    const stepPercent = document.getElementById('step-percent');

    // Step 1
    const inputOrganizador = document.getElementById('input-organizador');
    const checkParticipa = document.getElementById('check-participa');

    // Step 2
    const listaParticipantes = document.getElementById('lista-participantes');
    const btnAddParticipante = document.getElementById('btn-add-participante');
    const csvDropZone = document.getElementById('csv-drop-zone');
    const csvFileInput = document.getElementById('csv-file-input');

    // Step 3
    const btnNoExclusiones = document.getElementById('btn-no-exclusiones');
    const btnSiExclusiones = document.getElementById('btn-si-exclusiones');
    const panelExclusiones = document.getElementById('panel-exclusiones');
    const exclusionesList = document.getElementById('exclusiones-list');

    // Step 4
    const eventChips = document.querySelectorAll('.event-chip');
    const btnShowMoreEvents = document.getElementById('btn-show-more-events');
    const moreEvents = document.getElementById('more-events');
    const inputNombreEvento = document.getElementById('input-nombre-evento');

    // Step 5
    const fechaTitulo = document.getElementById('fecha-titulo');
    const fechasSugeridas = document.getElementById('fechas-sugeridas');
    const inputFecha = document.getElementById('input-fecha');

    // Step 6
    const budgetChips = document.querySelectorAll('.budget-chip');
    const inputPresupuesto = document.getElementById('input-presupuesto');

    // Toast
    const toastError = document.getElementById('toast-error');
    const toastMsg = document.getElementById('toast-msg');
    const toastSuccess = document.getElementById('toast-success');
    const toastSuccessMsg = document.getElementById('toast-success-msg');

    // ============================================
    // UTILIDADES
    // ============================================
    function showToast(message) {
        toastMsg.textContent = message;
        toastError.classList.remove('translate-x-[120%]', 'opacity-0', 'pointer-events-none');
        toastError.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => {
            toastError.classList.add('translate-x-[120%]', 'opacity-0', 'pointer-events-none');
            toastError.classList.remove('translate-x-0', 'opacity-100');
        }, 4000);
    }

    function showSuccessToast(message) {
        toastSuccessMsg.textContent = message;
        toastSuccess.classList.remove('translate-x-[120%]', 'opacity-0', 'pointer-events-none');
        toastSuccess.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => {
            toastSuccess.classList.add('translate-x-[120%]', 'opacity-0', 'pointer-events-none');
            toastSuccess.classList.remove('translate-x-0', 'opacity-100');
        }, 4000);
    }

    function goToStep(step) {
        // Ocultar paso actual
        steps[currentStep].classList.add('hidden');
        steps[currentStep].classList.remove('animate-fade-in-up');

        // Mostrar nuevo paso
        currentStep = step;
        steps[currentStep].classList.remove('hidden');
        // Re-trigger animation
        steps[currentStep].style.animation = 'none';
        steps[currentStep].offsetHeight; // force reflow
        steps[currentStep].style.animation = '';
        steps[currentStep].classList.add('animate-fade-in-up');

        // Update progress
        const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
        progressBar.style.width = pct + '%';
        stepLabel.textContent = `Paso ${currentStep} de ${TOTAL_STEPS}`;
        stepPercent.textContent = pct + '%';

        // Guardar el paso actual en sessionStorage
        sessionStorage.setItem('currentConfigStep', currentStep);

        // Scroll al top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // STEP 1: ORGANIZADOR
    // ============================================
    // Pre-cargar datos existentes
    const dataExistente = Storage.leer();
    if (dataExistente.evento.organizador) {
        inputOrganizador.value = dataExistente.evento.organizador;
    }
    checkParticipa.checked = dataExistente.evento.organizadorParticipa !== false;

    // Restaurar el paso actual si existe
    const savedStep = sessionStorage.getItem('currentConfigStep');
    if (savedStep) {
        const stepNum = parseInt(savedStep);
        if (stepNum > 1 && stepNum <= TOTAL_STEPS) {
            // Cargar datos necesarios para cada paso
            if (stepNum >= 2) renderParticipantes();
            if (stepNum >= 3) renderExclusiones();
            goToStep(stepNum);
        }
    }

    document.getElementById('btn-next-1').addEventListener('click', () => {
        const nombre = inputOrganizador.value.trim();
        if (!nombre) {
            showToast('Ingresa el nombre del organizador.');
            inputOrganizador.focus();
            return;
        }
        // Guardar en storage
        Model.actualizarOrganizador(nombre, checkParticipa.checked);
        renderParticipantes();
        goToStep(2);
    });

    // ============================================
    // STEP 2: PARTICIPANTES
    // ============================================
    function renderParticipantes() {
        const data = Storage.leer();
        listaParticipantes.innerHTML = '';

        data.participantes.forEach((nombre, index) => {
            const isOrganizador = nombre === data.evento.organizador && data.evento.organizadorParticipa;
            const row = document.createElement('div');
            row.className = 'flex items-center gap-3 group';
            row.innerHTML = `
                <input type="text" value="${nombre}" maxlength="40"
                    class="participante-input flex-1 bg-brand-900/50 border border-brand-700/50 rounded-xl px-4 py-3 text-white placeholder-brand-600 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors ${isOrganizador ? 'opacity-60 cursor-not-allowed' : ''}"
                    data-index="${index}" data-original="${nombre}" ${isOrganizador ? 'readonly' : ''}>
                ${!isOrganizador ? `
                <button class="btn-remove-participante w-8 h-8 rounded-full border border-brand-700/50 flex items-center justify-center text-brand-500 hover:text-red-400 hover:border-red-400/50 transition-colors opacity-0 group-hover:opacity-100" data-nombre="${nombre}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>` : ''}
            `;
            listaParticipantes.appendChild(row);
        });

        // Agregar un input vacío para nuevo participante
        const emptyRow = document.createElement('div');
        emptyRow.className = 'flex items-center gap-3';
        emptyRow.innerHTML = `
            <input type="text" placeholder="Añadir nombre ${data.participantes.length + 1}" maxlength="40"
                class="new-participante-input flex-1 bg-brand-900/50 border border-brand-700/50 rounded-xl px-4 py-3 text-white placeholder-brand-600 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-colors"
                data-index="${data.participantes.length}">
            <button class="btn-clear-new w-8 h-8 rounded-full border border-brand-700/50 flex items-center justify-center text-brand-500 hover:text-brand-300 hover:border-brand-500/50 transition-colors opacity-0" data-index="${data.participantes.length}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
        `;
        listaParticipantes.appendChild(emptyRow);

        // Bind events
        bindParticipanteEvents();
    }

    function bindParticipanteEvents() {
        // Editar participante existente al perder foco
        document.querySelectorAll('.participante-input:not([readonly])').forEach(input => {
            input.addEventListener('blur', (e) => {
                const original = e.target.dataset.original;
                const nuevo = e.target.value.trim();
                if (nuevo && nuevo !== original) {
                    // Eliminar el viejo y agregar el nuevo
                    Model.eliminarParticipante(original);
                    const result = Model.agregarParticipante(nuevo);
                    if (!result.success) {
                        showToast(result.message);
                    }
                    renderParticipantes();
                } else if (!nuevo) {
                    Model.eliminarParticipante(original);
                    renderParticipantes();
                }
            });
        });

        // Nuevo participante - al presionar Enter o perder foco
        document.querySelectorAll('.new-participante-input').forEach(input => {
            const handler = (e) => {
                const nombre = e.target.value.trim();
                if (nombre) {
                    const result = Model.agregarParticipante(nombre);
                    if (result.success) {
                        e.target.value = ''; // Limpiar el input
                        renderParticipantes();
                        // Focus en el nuevo input vacío
                        setTimeout(() => {
                            const newInput = listaParticipantes.querySelector('.new-participante-input');
                            if (newInput) newInput.focus();
                        }, 50);
                    } else {
                        showToast(result.message);
                        e.target.value = ''; // Limpiar también en caso de error
                    }
                }
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handler(e);
                }
            });
            input.addEventListener('blur', handler);

            // Mostrar botón de limpiar cuando se escribe
            input.addEventListener('input', (e) => {
                const clearBtn = e.target.parentElement.querySelector('.btn-clear-new');
                if (clearBtn) {
                    clearBtn.classList.toggle('opacity-0', !e.target.value);
                }
            });
        });

        // Botón eliminar
        document.querySelectorAll('.btn-remove-participante').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.currentTarget.dataset.nombre;
                Model.eliminarParticipante(nombre);
                renderParticipantes();
            });
        });

        // Botón limpiar nuevo input
        document.querySelectorAll('.btn-clear-new').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.currentTarget.parentElement.querySelector('.new-participante-input');
                if (input) {
                    input.value = '';
                    input.focus();
                    e.currentTarget.classList.add('opacity-0');
                }
            });
        });
    }

    // Botón "Añadir participante" (enfoca el input vacío)
    btnAddParticipante.addEventListener('click', () => {
        const newInput = listaParticipantes.querySelector('.new-participante-input');
        if (newInput) {
            newInput.focus();
        }
    });

    // ─── CSV DRAG & DROP (HTML5 API) ──────────────────────────────
    csvDropZone.addEventListener('click', () => csvFileInput.click());

    csvDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvDropZone.classList.add('border-white/40', 'bg-white/[0.04]');
    });

    csvDropZone.addEventListener('dragleave', () => {
        csvDropZone.classList.remove('border-white/40', 'bg-white/[0.04]');
    });

    csvDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        csvDropZone.classList.remove('border-white/40', 'bg-white/[0.04]');
        const file = e.dataTransfer.files[0];
        if (file) processCSV(file);
    });

    csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processCSV(file);
    });

    function processCSV(file) {
        if (!file.name.endsWith('.csv')) {
            showToast('El archivo debe ser un .csv');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/);
            let agregados = 0;
            let duplicados = 0;

            lines.forEach(line => {
                // Soportar comas y punto y coma como separadores
                const nombres = line.split(/[,;]/).map(n => n.trim()).filter(n => n.length > 0);
                nombres.forEach(nombre => {
                    const result = Model.agregarParticipante(nombre);
                    if (result.success) {
                        agregados++;
                    } else {
                        duplicados++;
                    }
                });
            });

            const mensaje = `✓ ${agregados} participantes agregados${duplicados > 0 ? `, ${duplicados} omitidos (duplicados)` : ''}`;
            showSuccessToast(mensaje);
            renderParticipantes();
        };
        reader.readAsText(file);
    }

    // Nav Step 2
    document.getElementById('btn-prev-2').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-next-2').addEventListener('click', () => {
        const data = Storage.leer();
        if (data.participantes.length < 3) {
            showToast('Se necesitan al menos 3 participantes para continuar.');
            return;
        }
        renderExclusiones();
        goToStep(3);
    });

    // ============================================
    // STEP 3: EXCLUSIONES
    // ============================================
    let exclusionesActivas = false;

    function setExclusionOption(activa) {
        exclusionesActivas = activa;
        if (activa) {
            btnSiExclusiones.classList.add('border-white/40', 'text-white', 'bg-white/5');
            btnSiExclusiones.classList.remove('border-brand-700/50', 'text-brand-300');
            btnNoExclusiones.classList.remove('border-white/40', 'text-white', 'bg-white/5');
            btnNoExclusiones.classList.add('border-brand-700/50', 'text-brand-300');
            panelExclusiones.classList.remove('hidden');
        } else {
            btnNoExclusiones.classList.add('border-white/40', 'text-white', 'bg-white/5');
            btnNoExclusiones.classList.remove('border-brand-700/50', 'text-brand-300');
            btnSiExclusiones.classList.remove('border-white/40', 'text-white', 'bg-white/5');
            btnSiExclusiones.classList.add('border-brand-700/50', 'text-brand-300');
            panelExclusiones.classList.add('hidden');
        }
    }

    btnNoExclusiones.addEventListener('click', () => setExclusionOption(false));
    btnSiExclusiones.addEventListener('click', () => setExclusionOption(true));

    function renderExclusiones() {
        const data = Storage.leer();
        exclusionesList.innerHTML = '';

        // Verificar si ya hay exclusiones para activar el panel
        const tieneExclusiones = Object.keys(data.exclusiones).some(k => data.exclusiones[k].length > 0);
        if (tieneExclusiones) {
            setExclusionOption(true);
        }

        data.participantes.forEach(persona => {
            const otrosParticipantes = data.participantes.filter(p => p !== persona);
            const excluidos = data.exclusiones[persona] || [];

            const block = document.createElement('div');
            block.className = 'space-y-2';
            block.innerHTML = `
                <p class="font-semibold text-white text-sm">${persona}</p>
                <div class="relative">
                    <button class="exclusion-dropdown-btn w-full text-left bg-brand-900/50 border border-brand-700/50 rounded-xl px-4 py-3 text-sm transition-colors hover:border-white/30 flex items-center justify-between" data-persona="${persona}">
                        <span class="${excluidos.length > 0 ? 'text-white' : 'text-brand-500'}">
                            ${excluidos.length > 0 ? excluidos.join(', ') : 'Selecciona los nombres que quieres excluir...'}
                        </span>
                        <svg class="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    <div class="exclusion-dropdown hidden absolute top-full left-0 right-0 mt-1 bg-brand-900 border border-brand-700/50 rounded-xl overflow-hidden z-20 shadow-xl shadow-black/50" data-persona="${persona}">
                        <div class="p-1 max-h-48 overflow-y-auto">
                            ${otrosParticipantes.map(otro => `
                                <label class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                    <input type="checkbox" class="excl-check w-4 h-4 rounded border-brand-600 bg-brand-800 accent-white cursor-pointer" 
                                        data-persona="${persona}" data-excluido="${otro}" ${excluidos.includes(otro) ? 'checked' : ''}>
                                    <span class="text-sm text-brand-300">${otro}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="border-t border-brand-800/50 p-2 flex justify-end gap-2">
                            <button class="exclusion-cancel text-xs px-3 py-1.5 text-brand-400 hover:text-white transition-colors" data-persona="${persona}">Cancelar</button>
                            <button class="exclusion-done text-xs px-4 py-1.5 bg-white text-black rounded-lg font-medium hover:bg-brand-200 transition-colors" data-persona="${persona}">Hecho</button>
                        </div>
                    </div>
                </div>
            `;
            exclusionesList.appendChild(block);
        });

        bindExclusionEvents();
    }

    function bindExclusionEvents() {
        // Toggle dropdown
        document.querySelectorAll('.exclusion-dropdown-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const persona = e.currentTarget.dataset.persona;
                const dropdown = document.querySelector(`.exclusion-dropdown[data-persona="${persona}"]`);
                // Cerrar todos los demás
                document.querySelectorAll('.exclusion-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });
        });

        // Checkbox changes
        document.querySelectorAll('.excl-check').forEach(check => {
            check.addEventListener('change', (e) => {
                const persona = e.target.dataset.persona;
                const excluido = e.target.dataset.excluido;
                if (e.target.checked) {
                    Model.agregarExclusion(persona, excluido);
                } else {
                    Model.eliminarExclusion(persona, excluido);
                }
            });
        });

        // "Hecho" button - close and update label
        document.querySelectorAll('.exclusion-done').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const persona = e.currentTarget.dataset.persona;
                const dropdown = document.querySelector(`.exclusion-dropdown[data-persona="${persona}"]`);
                dropdown.classList.add('hidden');
                // Update the button label
                const data = Storage.leer();
                const excluidos = data.exclusiones[persona] || [];
                const labelBtn = document.querySelector(`.exclusion-dropdown-btn[data-persona="${persona}"] span`);
                labelBtn.textContent = excluidos.length > 0 ? excluidos.join(', ') : 'Selecciona los nombres que quieres excluir...';
                labelBtn.className = excluidos.length > 0 ? 'text-white' : 'text-brand-500';
            });
        });

        // "Cancelar" button
        document.querySelectorAll('.exclusion-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const persona = e.currentTarget.dataset.persona;
                const dropdown = document.querySelector(`.exclusion-dropdown[data-persona="${persona}"]`);
                dropdown.classList.add('hidden');
            });
        });
    }

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.exclusion-dropdown') && !e.target.closest('.exclusion-dropdown-btn')) {
            document.querySelectorAll('.exclusion-dropdown').forEach(d => d.classList.add('hidden'));
        }
    });

    // Nav Step 3
    document.getElementById('btn-prev-3').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-next-3').addEventListener('click', () => {
        if (!exclusionesActivas) {
            // Limpiar todas las exclusiones si eligió "No establecer"
            Storage.guardarExclusiones({});
        }
        goToStep(4);
    });

    // ============================================
    // STEP 4: TIPO DE EVENTO
    // ============================================
    let selectedEvent = dataExistente.evento.nombre || '';

    // Pre-cargar nombre de evento si existe
    if (selectedEvent) {
        inputNombreEvento.value = selectedEvent;
    }

    // Event chip selection
    eventChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Deseleccionar todos
            document.querySelectorAll('.event-chip').forEach(c => {
                c.classList.remove('border-white/40', 'text-white', 'bg-white/5');
                c.classList.add('border-brand-700/50', 'text-brand-300');
            });
            // Seleccionar el actual
            e.currentTarget.classList.add('border-white/40', 'text-white', 'bg-white/5');
            e.currentTarget.classList.remove('border-brand-700/50', 'text-brand-300');
            selectedEvent = e.currentTarget.dataset.value;
            inputNombreEvento.value = selectedEvent;
        });
    });

    // Mostrar más eventos
    btnShowMoreEvents.addEventListener('click', () => {
        const isHidden = moreEvents.classList.contains('!hidden');
        if (isHidden) {
            moreEvents.classList.remove('!hidden');
            moreEvents.classList.add('flex', 'flex-wrap', 'gap-3');
        } else {
            moreEvents.classList.add('!hidden');
            moreEvents.classList.remove('flex', 'flex-wrap', 'gap-3');
        }
        btnShowMoreEvents.textContent = isHidden ? 'Mostrar menos' : 'Mostrar más';
    });

    // Si escribe un nombre personalizado, deseleccionar chips
    inputNombreEvento.addEventListener('input', () => {
        selectedEvent = inputNombreEvento.value;
        document.querySelectorAll('.event-chip').forEach(c => {
            if (c.dataset.value === selectedEvent) {
                c.classList.add('border-white/40', 'text-white', 'bg-white/5');
                c.classList.remove('border-brand-700/50', 'text-brand-300');
            } else {
                c.classList.remove('border-white/40', 'text-white', 'bg-white/5');
                c.classList.add('border-brand-700/50', 'text-brand-300');
            }
        });
    });

    // Nav Step 4
    document.getElementById('btn-prev-4').addEventListener('click', () => goToStep(3));
    document.getElementById('btn-next-4').addEventListener('click', () => {
        const nombre = inputNombreEvento.value.trim();
        if (!nombre) {
            showToast('Ingresa o selecciona un nombre para la celebración.');
            return;
        }
        selectedEvent = nombre;

        // Actualizar titulo de fecha con nombre del evento
        fechaTitulo.textContent = `¿Cuándo se celebra ${selectedEvent}?`;
        generarFechasSugeridas();
        goToStep(5);
    });

    // ============================================
    // STEP 5: FECHA
    // ============================================
    function generarFechasSugeridas() {
        fechasSugeridas.innerHTML = '';
        const hoy = new Date();
        const sugerencias = [];

        // Generar 3 fechas sugeridas: próximo viernes, sábado y domingo cercanos
        for (let i = 1; i <= 14; i++) {
            const d = new Date(hoy);
            d.setDate(d.getDate() + i);
            const dow = d.getDay();
            if (dow === 5 || dow === 6 || dow === 0) { // Viernes, Sábado, Domingo
                sugerencias.push(d);
            }
            if (sugerencias.length >= 3) break;
        }

        const formatter = new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        sugerencias.forEach(fecha => {
            const dateStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
            const btn = document.createElement('button');
            btn.className = 'fecha-sugerida w-full text-left px-4 py-3 rounded-xl border border-brand-700/50 text-brand-300 hover:text-white hover:border-white/30 transition-colors text-sm font-medium capitalize';
            btn.dataset.value = dateStr;
            btn.textContent = formatter.format(fecha);
            fechasSugeridas.appendChild(btn);
        });

        // Botón "Otro"
        const btnOtro = document.createElement('button');
        btnOtro.className = 'fecha-sugerida w-full text-left px-4 py-3 rounded-xl border border-brand-700/50 text-brand-300 hover:text-white hover:border-white/30 transition-colors text-sm font-medium flex items-center gap-2';
        btnOtro.dataset.value = 'custom';
        btnOtro.innerHTML = 'Otro <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>';
        fechasSugeridas.appendChild(btnOtro);

        // Pre-seleccionar si ya hay fecha
        const existingDate = dataExistente.evento.fecha;
        if (existingDate) {
            inputFecha.value = existingDate;
        }

        // Bind click events
        fechasSugeridas.querySelectorAll('.fecha-sugerida').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Deseleccionar todos
                fechasSugeridas.querySelectorAll('.fecha-sugerida').forEach(b => {
                    b.classList.remove('border-white/40', 'text-white', 'bg-white/5');
                    b.classList.add('border-brand-700/50', 'text-brand-300');
                });
                // Seleccionar este
                e.currentTarget.classList.add('border-white/40', 'text-white', 'bg-white/5');
                e.currentTarget.classList.remove('border-brand-700/50', 'text-brand-300');

                const val = e.currentTarget.dataset.value;
                if (val === 'custom') {
                    inputFecha.focus();
                } else {
                    inputFecha.value = val;
                }
            });
        });
    }

    // Nav Step 5
    document.getElementById('btn-prev-5').addEventListener('click', () => goToStep(4));
    document.getElementById('btn-next-5').addEventListener('click', () => {
        if (!inputFecha.value) {
            showToast('Selecciona una fecha para la celebración.');
            return;
        }
        goToStep(6);
    });

    // ============================================
    // STEP 6: PRESUPUESTO
    // ============================================
    // Pre-cargar presupuesto
    if (dataExistente.evento.presupuesto) {
        inputPresupuesto.value = dataExistente.evento.presupuesto;
    }

    budgetChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Deseleccionar todos
            budgetChips.forEach(c => {
                c.classList.remove('border-white/40', 'text-white', 'bg-white/5');
                c.classList.add('border-brand-700/50', 'text-brand-300');
            });
            // Seleccionar este
            e.currentTarget.classList.add('border-white/40', 'text-white', 'bg-white/5');
            e.currentTarget.classList.remove('border-brand-700/50', 'text-brand-300');

            const val = e.currentTarget.dataset.value;
            if (val === 'custom') {
                inputPresupuesto.value = '';
                inputPresupuesto.focus();
            } else {
                inputPresupuesto.value = val;
            }
        });
    });

    // Sync chip highlight with typed value
    inputPresupuesto.addEventListener('input', () => {
        const val = inputPresupuesto.value;
        budgetChips.forEach(c => {
            if (c.dataset.value === val) {
                c.classList.add('border-white/40', 'text-white', 'bg-white/5');
                c.classList.remove('border-brand-700/50', 'text-brand-300');
            } else {
                c.classList.remove('border-white/40', 'text-white', 'bg-white/5');
                c.classList.add('border-brand-700/50', 'text-brand-300');
            }
        });
    });

    // Nav Step 6
    document.getElementById('btn-prev-6').addEventListener('click', () => goToStep(5));
    document.getElementById('btn-finish').addEventListener('click', () => {
        const presupuesto = inputPresupuesto.value.trim();
        if (!presupuesto || isNaN(presupuesto) || Number(presupuesto) <= 0) {
            showToast('Ingresa un presupuesto válido.');
            return;
        }

        // Guardar toda la configuración del evento
        const resultado = Model.configurarEvento({
            nombreOrganizador: inputOrganizador.value.trim(),
            organizadorParticipa: checkParticipa.checked,
            nombreEvento: selectedEvent,
            fecha: inputFecha.value,
            presupuesto: presupuesto
        });

        if (resultado.success) {
            // Redirigir al resumen
            window.location.href = 'resumen.html';
        } else {
            showToast(resultado.message);
        }
    });
});
