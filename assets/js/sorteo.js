import { Storage } from './storage.js';

/**
 * Módulo dedicado EXCLUSIVAMENTE a la lógica matemática del sorteo (algoritmo de asignación).
 * Se encarga de mezclar participantes y asignar quién le regala a quién respetando las exclusiones.
 */

export const Sorteo = {
    /**
     * Mezcla un array aleatoriamente usando el algoritmo de Fisher-Yates
     */
    mezclar: (array) => {
        const mezclado = [...array];
        for (let i = mezclado.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mezclado[i], mezclado[j]] = [mezclado[j], mezclado[i]];
        }
        return mezclado;
    },

    /**
     * Genera los pares del intercambio validando las reglas.
     */
    generar: () => {
        const data = Storage.leer();
        const participantes = data.participantes;
        const exclusiones = data.exclusiones;

        // Validaciones iniciales
        if (participantes.length < 3) {
            return {
                success: false,
                message: 'Se necesitan al menos 3 participantes para hacer el intercambio.',
                data: null
            };
        }

        // Intentar hacer el sorteo hasta un máximo de veces (por si cae en un callejón sin salida)
        const MAX_INTENTOS = 1000;
        
        for (let intento = 0; intento < MAX_INTENTOS; intento++) {
            // Mezclamos a todos los participantes
            const receptoresDisponibles = Sorteo.mezclar(participantes);
            const resultados = [];
            let exito = true;

            // Recorremos cada persona que tiene que dar un regalo
            for (let i = 0; i < participantes.length; i++) {
                const donador = participantes[i];
                let receptorAsignado = null;

                // Buscamos un receptor válido en los que quedan disponibles
                for (let j = 0; j < receptoresDisponibles.length; j++) {
                    const receptorPotencial = receptoresDisponibles[j];

                    // REGLA 1: No me puedo regalar a mí mismo
                    const esMismo = donador === receptorPotencial;
                    
                    // REGLA 2: No puedo regalarle a alguien que tengo excluido
                    const listaNegra = exclusiones[donador] || [];
                    const esExcluido = listaNegra.includes(receptorPotencial);

                    // Si pasa las reglas, ¡es un match válido!
                    if (!esMismo && !esExcluido) {
                        receptorAsignado = receptorPotencial;
                        // Lo quitamos de los disponibles para que nadie más le regale
                        receptoresDisponibles.splice(j, 1);
                        break;
                    }
                }

                // Si al final del ciclo no le pudimos asignar a nadie, este intento falló
                if (!receptorAsignado) {
                    exito = false;
                    break; 
                }

                resultados.push({
                    da: donador,
                    recibe: receptorAsignado
                });
            }

            // Si llegamos aquí y fue un éxito, guardamos y terminamos
            if (exito) {
                Storage.guardarResultados(resultados);
                return {
                    success: true,
                    message: 'Sorteo generado con éxito.',
                    data: resultados
                };
            }
        }

        // Si después de 1000 intentos no se logró, es matemáticamente imposible con esas exclusiones
        return {
            success: false,
            message: 'Es matemáticamente imposible realizar el sorteo con las exclusiones actuales. Por favor, relaja algunas reglas.',
            data: null
        };
    }
};
