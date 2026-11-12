# ⚖️ Anonimizador de documentos

Herramienta web estática para anonimizar documentos (judiciales, contratos, informes, sucesiones, etc.) en pocos pasos. Se abre en el navegador, sin instalar nada.

## ¿Qué problema resuelve?
 
Hoy casi todos usamos inteligencia artificial para trabajar, pero **la protección de datos tiene que estar presente siempre**, junto con el **uso ético** de estas herramientas. Antes de compartir un documento con una IA, o con cualquier servicio externo, conviene preguntarse qué datos personales viajan con él.
 
Este anonimizador es **una solución** para ese paso previo: permite reemplazar datos personales y sensibles (nombres, DNI, CUIT, expedientes, direcciones, patentes, inmuebles, etc.) **antes** de compartir, analizar o utilizar un documento con herramientas de IA, y lo hace **localmente en tu navegador**, sin enviar nada a la nube. No es la única medida ni reemplaza una buena gobernanza de datos, pero ayuda a aplicar la privacidad desde el diseño (*privacy by design*).


![Captura de la aplicación Anonimizador de documentos](assets/anonimizador.png)

## Qué hace

1. Cargás un **PDF**, un **Word (.docx)** o un **.txt**.
2. Elegís qué datos anonimizar.
3. Revisás el resultado, que podés editar.
4. Descargás el documento anonimizado en **.docx** o **.txt**.

Al terminar muestra un **resumen** de lo reemplazado (por ejemplo, cantidad de personas, DNI y expedientes).

## Qué detecta

- Carátulas y números de expediente (expte., causa, CUIJ, SAC, legajo, autos, o el número suelto con formato `12345/2025`)
- DNI y CUIT/CUIL
- Nombres y apellidos (patrones como `APELLIDO, Nombre` o `Sr./Dra. Nombre`)
- Direcciones
- Emails, teléfonos y CBU
- Vehículos: patentes (formato viejo `AAA123` y Mercosur `AB123CD`), chasis y motor
- Inmuebles: matrícula, partida, nomenclatura catastral
- Juzgado o tribunal (opcional, desactivado por defecto: cada usuario decide si es un dato relevante)
- Cualquier dato que agregues en la **lista manual** (uno por línea)

## Tecnologías
 
- **HTML5, CSS3 y JavaScript** (sin frameworks): interfaz y lógica de la aplicación.
- **Expresiones regulares**: detección de datos (DNI, CUIT/CUIL, expedientes, patentes, etc.).
- **[PDF.js](https://mozilla.github.io/pdf.js/)** (v3.11.174): lectura de archivos PDF.
- **[Mammoth.js](https://github.com/mwilliamson/mammoth.js)** (v1.6.0): lectura de archivos Word (.docx).
- **[JSZip](https://stuk.github.io/jszip/)** (v3.10.1): generación del archivo .docx de salida.
- **GitHub Pages**: publicación del sitio.


## Pensado para un uso concreto

Esta herramienta está **hecha a medida para mis usos**: la diseñé pensando en los documentos con los que trabajo (documentos judiciales, contratos, informes y sucesiones) y en los datos que en ellos suele ser necesario anonimizar. Por eso las reglas de detección responden a esos casos.

Esto significa que **no va a anonimizar todo**: la detección automática resuelve la mayor parte, pero siempre hay que controlar el resultado e indicar de forma manual los datos que falten.

Sin perjuicio de eso, **podés usarla y complementarla manualmente** con la lista de datos a anonimizar. Y si el proyecto te gusta y querés usarlo con otros tipos de documento, **podés adaptarlo**: los patrones de detección están en `app.js` (función `anonymize`) y se pueden editar para sumar, quitar o cambiar los datos clave que te interesen.

## Privacidad

Todo el procesamiento ocurre **localmente en tu navegador**. El documento no se envía a ningún servidor de terceros ni a la nube. La página solo descarga las librerías de lectura (PDF.js, Mammoth y JSZip) desde un CDN.

## Limitaciones

- Es un **prototipo**: la detección se basa en patrones y no es infalible. La primera pasada resuelve la mayor parte, pero es **necesario controlar el resultado**: es recomendable leerlo y, si quedó algún dato sin anonimizar (por ejemplo un expediente o un nombre), **copialo y pegalo de forma manual en la lista** (uno por línea) y volvé a presionar *Anonimizar*.
- El resultado se genera como texto plano, por lo que **no conserva el formato original** (tablas, negritas, encabezados). Ideal para usarlo con tu agente de IA.
- Los **PDF escaneados** (imágenes) necesitan OCR previo.
- No reemplaza el criterio profesional ni las obligaciones legales de protección de datos personales.

## Uso

Descargá los archivos en la misma carpeta y abrí `index.html` con doble clic, o publicalo con GitHub Pages (*Settings → Pages*).

## Estructura

```
index.html   → estructura de la página
styles.css   → estilos y diseño
app.js       → lógica de lectura, detección, resumen y descarga
assets/      → capturas de pantalla (anonimizador.png)
```

> No subas NUNCA a un repositorio documentos reales ni ejemplos con datos verdaderos.

## 👤 Desarrollado por:

Noelia Natalia María Orsini  
Abogada (UBA - Esp. Derecho Empresarial) | Counselor / Consultora Psicológica | Desarrolladora Back-End | Analista de Datos | Especialista en Agentes IA y  QA Automation en formación.

### 🔗 Enlaces Profesionales
* 💼 **LinkedIn:** [linkedin.com/in/noelia-orsini](https://www.linkedin.com/in/noelia-orsini)
* 🐙 **GitHub:** [github.com/NoeliaOrsini](https://github.com/NoeliaOrsini)
* 🌐 **Portafolio:** [noelia-orsini-portafolio.lovable.app](https://noelia-orsini-portafolio.lovable.app/)
