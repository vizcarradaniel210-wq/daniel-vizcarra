/*
==================================================
 PROYECTO: SISTEMA DE CONTROL DE NOTAS
 Autor: Justin Alexander Ruiz Fuentes
 INCOA | 1TB Software | Código 26
 Año: 2026

 Funciones:
 - Capturar datos del estudiante.
 - Validar las calificaciones.
 - Calcular el promedio.
 - Clasificar el rendimiento.
 - Exportar los registros a notas.txt.
 - Consultar registros y estadísticas.
==================================================
*/

// Obtener elementos del formulario
const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
const error = document.getElementById("error");
const botonGuardar = document.getElementById("guardar");

// Elementos de consulta
const archivo = document.getElementById("archivo");
const botonMostrar = document.getElementById("mostrar");
const tablaContenedor =
    document.getElementById("tablaContenedor");
const mensajeConsulta =
    document.getElementById("mensajeConsulta");
const estadisticas =
    document.getElementById("estadisticas");

// Lista temporal de registros
let registros = [];

// Último estudiante calculado
let estudianteActual = null;


/*
========================================
 1. CLASIFICAR EL PROMEDIO
========================================
*/
function clasificar(promedio) {
    if (promedio >= 9) {
        return "Excelente";
    } else if (promedio >= 7) {
        return "Muy bueno";
    } else if (promedio >= 6) {
        return "Aprobado";
    } else {
        return "Reprobado";
    }
}


/*
========================================
 2. CAPTURAR Y CALCULAR
========================================
*/
formulario.addEventListener("submit", function(evento) {

    // Evitar la recarga automática de la página
    evento.preventDefault();

    error.textContent = "";
    resultado.style.display = "none";
    botonGuardar.hidden = true;
    estudianteActual = null;

    // Capturar datos utilizando .value
    const nombre = document.getElementById("nombre")
        .value.trim();

    const nie = document.getElementById("nie")
        .value.trim();

    const nota1Texto = document.getElementById("nota1")
        .value.trim();

    const nota2Texto = document.getElementById("nota2")
        .value.trim();

    const nota3Texto = document.getElementById("nota3")
        .value.trim();

    const examenTexto = document.getElementById("examen")
        .value.trim();

    // Comprobar que ningún campo esté vacío
    if (
        nombre === "" ||
        nie === "" ||
        nota1Texto === "" ||
        nota2Texto === "" ||
        nota3Texto === "" ||
        examenTexto === ""
    ) {
        error.textContent =
            "⚠ ERROR: Debe completar todos los campos.";
        return;
    }

    // Convertir las notas a números
    const nota1 = Number(nota1Texto);
    const nota2 = Number(nota2Texto);
    const nota3 = Number(nota3Texto);
    const examen = Number(examenTexto);

    const notas = [nota1, nota2, nota3, examen];

    // Validar que sean números entre 0 y 10
    const notasValidas = notas.every(function(nota) {
        return Number.isFinite(nota) &&
               nota >= 0 &&
               nota <= 10;
    });

    if (!notasValidas) {
        error.textContent =
            "⚠ ERROR: La nota debe estar entre 0 y 10.";
        return;
    }

    // Calcular promedio
    const promedio =
        (nota1 + nota2 + nota3 + examen) / 4;

    // Obtener clasificación
    const clasificacion = clasificar(promedio);

    // Guardar los datos temporalmente
    estudianteActual = {
        nie: nie.replace(/\|/g, "/"),
        nombre: nombre.replace(/\|/g, "/"),
        nota1,
        nota2,
        nota3,
        examen,
        promedio: promedio.toFixed(2),
        clasificacion
    };

    // Mostrar resultado
    resultado.replaceChildren();

    const titulo = document.createElement("h3");
    titulo.textContent = "ESTUDIANTE: " + nombre;

    const identificacion = document.createElement("p");
    identificacion.textContent = "NIE: " + nie;

    const promedioTexto = document.createElement("div");
    promedioTexto.className = "promedio";
    promedioTexto.textContent = promedio.toFixed(2);

    const clasificacionTexto = document.createElement("p");
    clasificacionTexto.className = "clasificacion";
    clasificacionTexto.textContent =
        "RESULTADO: " + clasificacion.toUpperCase();

    resultado.append(
        titulo,
        identificacion,
        promedioTexto,
        clasificacionTexto
    );

    resultado.style.display = "block";
    botonGuardar.hidden = false;

    console.log("Promedio calculado:", promedio.toFixed(2));
});


/*
========================================
 3. CONVERTIR REGISTROS A FORMATO TXT
========================================
*/

// Cada estudiante se guarda en una línea.
// Los campos se separan con el símbolo |
function convertirATxt(lista) {
    return lista.map(function(estudiante) {
        return [
            estudiante.nie,
            estudiante.nombre,
            estudiante.nota1,
            estudiante.nota2,
            estudiante.nota3,
            estudiante.examen,
            estudiante.promedio,
            estudiante.clasificacion
        ].join("|");
    }).join("\n");
}


/*
========================================
 4. GUARDAR EN NOTAS.TXT
========================================
*/

botonGuardar.addEventListener("click", function() {

    if (!estudianteActual) {
        return;
    }

    // Evitar duplicar el mismo registro al pulsar varias veces
    const yaExiste = registros.some(function(estudiante) {
        return estudiante.nie === estudianteActual.nie;
    });

    if (yaExiste) {
        error.textContent =
            "⚠ Este NIE ya existe en los registros cargados.";
        return;
    }

    // Agregar el nuevo registro a la lista temporal
    registros.push(estudianteActual);

    // Preparar el contenido del archivo
    const contenido = convertirATxt(registros);

    // Crear un archivo descargable
    const blob = new Blob(
        [contenido + "\n"],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "notas.txt";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);

    error.style.color = "#78edb4";
    error.textContent =
        "✓ Registro agregado. Se descargó notas.txt.";

    console.log("Archivo TXT preparado correctamente.");
});


/*
========================================
 5. LEER Y CONSULTAR NOTAS.TXT
========================================
*/

// Convertir una línea de texto en un objeto
function interpretarLinea(linea) {
    const partes = linea.split("|");

    if (partes.length !== 8) {
        return null;
    }

    const [
        nie, nombre, n1, n2, n3,
        examen, promedio, clasificacion
    ] = partes;

    const notas = [n1, n2, n3, examen].map(Number);
    const promedioNum = Number(promedio);

    if (
        !nie.trim() ||
        !nombre.trim() ||
        notas.some(n => !Number.isFinite(n) || n < 0 || n > 10) ||
        !Number.isFinite(promedioNum)
    ) {
        return null;
    }

    return {
        nie,
        nombre,
        nota1: notas[0],
        nota2: notas[1],
        nota3: notas[2],
        examen: notas[3],
        promedio: promedioNum.toFixed(2),
        clasificacion
    };
}


// Leer el archivo seleccionado por el usuario
botonMostrar.addEventListener("click", function() {

    const archivoSeleccionado = archivo.files[0];

    if (!archivoSeleccionado) {
        mensajeConsulta.textContent =
            "⚠ Selecciona primero un archivo notas.txt.";
        return;
    }

    const lector = new FileReader();

    lector.onload = function() {
        const contenido = lector.result;

        const lineas = contenido
            .split(/\r?\n/)
            .filter(linea => linea.trim() !== "");

        const encontrados = [];
        let errores = 0;

        lineas.forEach(function(linea) {
            const estudiante = interpretarLinea(linea);

            if (estudiante) {
                encontrados.push(estudiante);
            } else {
                errores++;
            }
        });

        // Reemplazar los registros temporales con el archivo leído
        registros = encontrados;

        mensajeConsulta.textContent =
            errores > 0
            ? "Se encontraron " + errores +
              " líneas con formato incorrecto."
            : "Archivo leído correctamente.";

        mostrarTabla(registros);
    };

    lector.onerror = function() {
        mensajeConsulta.textContent =
            "⚠ No se pudo leer el archivo.";
    };

    lector.readAsText(archivoSeleccionado);
});


/*
========================================
 6. MOSTRAR TABLA Y ESTADÍSTICAS
========================================
*/

function mostrarTabla(lista) {
    tablaContenedor.replaceChildren();
    estadisticas.replaceChildren();

    if (lista.length === 0) {
        mensajeConsulta.textContent =
            "No hay registros válidos para mostrar.";
        estadisticas.hidden = true;
        return;
    }

    // Crear tabla de resultados
    const tabla = document.createElement("table");
    const encabezado = document.createElement("thead");
    const filaTitulos = document.createElement("tr");

    ["NIE", "Estudiante", "Promedio", "Resultado"]
        .forEach(function(titulo) {
            const th = document.createElement("th");
            th.textContent = titulo;
            filaTitulos.appendChild(th);
        });

    encabezado.appendChild(filaTitulos);

    const cuerpo = document.createElement("tbody");

    lista.forEach(function(estudiante) {
        const fila = document.createElement("tr");

        [
            estudiante.nie,
            estudiante.nombre,
            estudiante.promedio,
            estudiante.clasificacion
        ].forEach(function(valor) {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        cuerpo.appendChild(fila);
    });

    tabla.append(encabezado, cuerpo);
    tablaContenedor.appendChild(tabla);

    // Calcular estadísticas
    const aprobados = lista.filter(function(estudiante) {
        return Number(estudiante.promedio) >= 6;
    }).length;

    const reprobados = lista.length - aprobados;

    // Mostrar estadísticas
    const titulo = document.createElement("h3");
    titulo.textContent = "RESUMEN ACADÉMICO";

    const total = document.createElement("p");
    total.textContent =
        "Total de estudiantes: " + lista.length;

    const aprobadosTexto = document.createElement("p");
    aprobadosTexto.textContent =
        "Aprobados: " + aprobados;

    const reprobadosTexto = document.createElement("p");
    reprobadosTexto.textContent =
        "Reprobados: " + reprobados;

    estadisticas.append(
        titulo,
        total,
        aprobadosTexto,
        reprobadosTexto
    );

    estadisticas.hidden = false;
}