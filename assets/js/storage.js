/**
 * storage.js
 * Módulo encargado EXCLUSIVAMENTE de manejar las operaciones CRUD con LocalStorage.
 * Llave base: 'nexgift_data'
 */
const STORAGE_KEY = 'nexgift_data';

// Estructura por defecto que tendrá nuestro Storage
const DEFAULT_DATA = {
    evento: {
        nombre: '',
        fecha: '',
        presupuesto: '',
        organizador: '',
        organizadorParticipa: true
    },
    participantes: [], // Array de strings o de objetos { id, nombre }
    exclusiones: {},   // Objeto donde la llave es el id/nombre y el valor es un array de excluidos
    resultados: []     // Array de pares { da: 'Carlos', recibe: 'Ana' } tras el sorteo
};

export const Storage = {
    /**
     * Lee toda la información del LocalStorage.
     */
    leer: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return DEFAULT_DATA;
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer LocalStorage:', error);
            return DEFAULT_DATA;
        }
    },

    /**
     * Guarda el objeto completo en LocalStorage.
     */
    guardar: (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar en LocalStorage:', error);
        }
    },

    /**
     * Borra absolutamente todo del LocalStorage para iniciar un nuevo intercambio.
     */
    limpiar: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    // ------------------------------------------------------------------------
    // MÉTODOS DE ACTUALIZACIÓN PARCIAL
    // ------------------------------------------------------------------------
    /**
     * Actualiza solo la información del evento { nombre, fecha, presupuesto, organizador }
     */
    guardarEvento: (infoEvento) => {
        const data = Storage.leer();
        data.evento = { ...data.evento, ...infoEvento };
        Storage.guardar(data);
    },

    /**
     * Actualiza la lista completa de participantes
     */
    guardarParticipantes: (participantes) => {
        const data = Storage.leer();
        data.participantes = participantes;
        Storage.guardar(data);
    },

    /**
     * Actualiza las exclusiones de quién no le da a quién { 'Maria': ['Juan'], 'Pedro': ['Luis', 'Ana'] }
     */
    guardarExclusiones: (exclusiones) => {
        const data = Storage.leer();
        data.exclusiones = exclusiones;
        Storage.guardar(data);
    },

    /**
     * Guarda los resultados definitivos tras oprimir el botón Sortear.
     */
    guardarResultados: (pares) => {
        const data = Storage.leer();
        data.resultados = pares;
        Storage.guardar(data);
    }
};
