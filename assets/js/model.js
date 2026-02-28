import { Storage } from './storage.js';

/**
 * Centraliza la lógica de negocio (entidades, validaciones y matemáticas).
 */
export const Model = {
    // ==========================================
    // PARTICIPANTES
    // ==========================================
    /**
     * Valida y agrega un nuevo participante a la lista.
     */
    agregarParticipante: (nombre) => {
        const nombreLimpio = nombre.trim();
        
        if (!nombreLimpio) {
            return { success: false, message: 'El nombre no puede estar vacío.' };
        }

        const data = Storage.leer();
        
        // Validación: ¿choca con el nombre del organizador que NO participa?
        if (!data.evento.organizadorParticipa && data.evento.organizador && nombreLimpio.toLowerCase() === data.evento.organizador.toLowerCase()) {
            return { success: false, message: 'Este nombre está reservado para el organizador (que no participa).' };
        }

        const existe = data.participantes.includes(nombreLimpio);

        if (existe) {
            return { success: false, message: 'Este participante ya ha sido agregado.' };
        }

        data.participantes.push(nombreLimpio);
        Storage.guardarParticipantes(data.participantes);

        return { success: true, message: 'Participante agregado con éxito.' };
    },

    /**
     * Elimina a un participante de la lista y limpia sus exclusiones asociadas.
     */
    eliminarParticipante: (nombre) => {
        const data = Storage.leer();
        
        // Quitarlo del array de participantes
        data.participantes = data.participantes.filter(p => p !== nombre);
        Storage.guardarParticipantes(data.participantes);

        // Limpiar su llave en exclusiones (si la tenía)
        if (data.exclusiones[nombre]) {
            delete data.exclusiones[nombre];
            Storage.guardarExclusiones(data.exclusiones);
        }

        // Quitarlo de las listas de exclusión de los demás (si alguien lo había excluido)
        let exclusionesModificadas = false;
        for (const owner in data.exclusiones) {
            const index = data.exclusiones[owner].indexOf(nombre);
            if (index > -1) {
                data.exclusiones[owner].splice(index, 1);
                exclusionesModificadas = true;
            }
        }
        
        if (exclusionesModificadas) {
            Storage.guardarExclusiones(data.exclusiones);
        }
    },

    // ==========================================
    // EXCLUSIONES
    // ==========================================
    /**
     * Agregar un participante a la lista de exclusiones de otro participante.
     */
    agregarExclusion: (quienExcluye, quienEsExcluido) => {
        const excluyente = quienExcluye.trim();
        const excluido = quienEsExcluido.trim();
        
        if (!excluyente || !excluido) {
            return { success: false, message: 'Los nombres no pueden estar vacíos.' };
        }
        
        if (excluyente === excluido) {
            return { success: false, message: 'Una persona no puede excluirse a sí misma.' };
        }

        const data = Storage.leer();

        // Inicializar el array de exclusiones si no existe para esta persona
        if (!data.exclusiones[excluyente]) {
            data.exclusiones[excluyente] = [];
        }

        // Comprobar si ya está excluido
        if (data.exclusiones[excluyente].includes(excluido)) {
            return { success: false, message: 'El participante ya estaba en la lista de exclusiones.' };
        }

        data.exclusiones[excluyente].push(excluido);
        Storage.guardarExclusiones(data.exclusiones);
        
        return { success: true, message: 'Exclusión guardada con éxito.' };
    },

    /**
     * Elimina un participante de la lista de exclusion de otro participante
     */
    eliminarExclusion: (quienExcluye, quienEsExcluido) => {
        const excluyente = quienExcluye.trim();
        const excluido = quienEsExcluido.trim();
        
        const data = Storage.leer();

        if (!data.exclusiones[excluyente]) {
            return { success: false, message: 'No hay exclusiones registradas para esta persona.' };
        }

        const index = data.exclusiones[excluyente].indexOf(excluido);
        if (index > -1) {
            data.exclusiones[excluyente].splice(index, 1);
            Storage.guardarExclusiones(data.exclusiones);
            return { success: true, message: 'Exclusión eliminada con éxito.' };
        } else {
            return { success: false, message: 'El nombre no estaba en la lista de exclusiones.' };
        }
    },

    // ==========================================
    // ORGANIZADOR Y EVENTO
    // ==========================================
    /**
     * Guarda la configuración del evento { nombreEvento, fecha, presupuesto, nombreOrganizador, organizadorParticipa }
     */
    configurarEvento: (formData) => {
        const nombreOrg = formData.nombreOrganizador.trim();
        const nombreEvt = formData.nombreEvento.trim();
        
        if (!nombreOrg || !nombreEvt) {
            return { success: false, message: 'El nombre del evento y del organizador son obligatorios.' };
        }

        // Llamamos a actualizarOrganizador para que maneje la lógica cruzada con la lista de participantes
        Model.actualizarOrganizador(nombreOrg, formData.organizadorParticipa);

        // Guardamos el resto de los datos del evento
        Storage.guardarEvento({
            nombre: nombreEvt,
            fecha: formData.fecha || '',
            presupuesto: formData.presupuesto || ''
        });

        return { success: true, message: 'Evento configurado correctamente.' };
    },

    /**
     * Actualiza la información del organizador y maneja si participa o no
     */
    actualizarOrganizador: (nombre, participa) => {
        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) {
            return { success: false, message: 'El nombre del organizador no puede estar vacío.' };
        }

        const data = Storage.leer();
        const nombreAnterior = data.evento.organizador;
        const participabaAntes = data.evento.organizadorParticipa;

        // Si cambió el nombre pero participaba, lo quitamos de participantes
        if (nombreAnterior && participabaAntes && nombreAnterior !== nombreLimpio) {
            Model.eliminarParticipante(nombreAnterior);
        }
        
        // Si antes participaba y ahora no, lo sacamos del sorteo
        if (nombreAnterior === nombreLimpio && participabaAntes && !participa) {
            Model.eliminarParticipante(nombreLimpio);
        }

        Storage.guardarEvento({
            organizador: nombreLimpio,
            organizadorParticipa: participa
        });

        // Si participa, lo agregamos a la lista automáticamente
        if (participa) {
            // Volvemos a leer ya que data pudo cambiar en eliminarParticipante
            const newData = Storage.leer();
            if (!newData.participantes.includes(nombreLimpio)) {
                newData.participantes.unshift(nombreLimpio); // Agregarlo al inicio
                Storage.guardarParticipantes(newData.participantes);
            }
        }
        
        return { success: true, message: 'Organizador actualizado.' };
    }
};
