import { Storage } from '../storage.js';

/**
 * ui-resumen.js
 * Controlador para la página de resumen.html. 
 * Solo lee los datos de localStorage para mostrarlos y habilita el botón de sorteo.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias al DOM
    const ui = {
        nombre: document.getElementById('res-nombre'),
        organizador: document.getElementById('res-org'),
        fecha: document.getElementById('res-fecha'),
        presupuesto: document.getElementById('res-presupuesto'),
        
        totalPart: document.getElementById('res-total-part'),
        listaPart: document.getElementById('res-lista-part'),
        
        totalExcl: document.getElementById('res-total-excl'),
        
        errorBanner: document.getElementById('res-error'),
        errorMsg: document.getElementById('res-error-msg'),
        btnSorteo: document.getElementById('btn-sorteo')
    };

    // 2. Extraer datos del modelo/storage
    const data = Storage.leer();
    
    // -- Llenar Detalles del Evento --
    ui.nombre.innerText = data.evento.nombre || 'Sin nombre';
    ui.organizador.innerText = data.evento.organizador || 'No especificado';
    ui.fecha.innerText = data.evento.fecha || 'Sin fecha';
    ui.presupuesto.innerText = data.evento.presupuesto ? `$${data.evento.presupuesto}` : 'No definido';

    // -- Llenar Participantes --
    const numPart = data.participantes.length;
    ui.totalPart.innerText = numPart;
    
    // Llenar "Badges" (Tarjetas chiquitas) solo con los primeros 5 participantes para no romper el diseño
    ui.listaPart.innerHTML = '';
    const MAX_MOSTRAR = 5;
    
    if (numPart > 0) {
        data.participantes.slice(0, MAX_MOSTRAR).forEach(p => {
            const badge = document.createElement('span');
            badge.className = 'px-3 py-1 bg-brand-800/40 rounded-md border border-brand-700/50 text-xs tracking-wide';
            badge.innerText = p;
            ui.listaPart.appendChild(badge);
        });

        // Si hay más de 5, poner un badge de "+X personas"
        if (numPart > MAX_MOSTRAR) {
            const extra = document.createElement('span');
            extra.className = 'px-3 py-1 text-brand-500 font-medium text-xs flex items-center bg-black/40 rounded-md';
            extra.innerText = `+${numPart - MAX_MOSTRAR} más`;
            ui.listaPart.appendChild(extra);
        }
    } else {
        ui.listaPart.innerHTML = '<span class="text-brand-600 italic">No hay participantes registrados.</span>';
    }

    // -- Llenar Exclusiones --
    let numReglas = 0;
    for (const owner in data.exclusiones) {
        numReglas += data.exclusiones[owner].length; // Contar reglas de cada participante
    }
    ui.totalExcl.innerText = numReglas;

    // 3. Validar estado para permitir avanzar al Sorteo
    let tieneErrores = false;
    
    if (!data.evento.nombre || !data.evento.organizador) {
        ui.errorMsg.innerText = 'Faltan los detalles del evento (Nombre y/o Organizador). Ve a Configurar.';
        tieneErrores = true;
    } else if (numPart < 3) {
        ui.errorMsg.innerText = 'Se requieren al menos 3 participantes para realizar el sorteo. Tienes ' + numPart + '.';
        tieneErrores = true;
    }

    if (tieneErrores) {
        ui.errorBanner.classList.remove('hidden');
        ui.btnSorteo.classList.add('opacity-50', 'pointer-events-none');
    }
});
