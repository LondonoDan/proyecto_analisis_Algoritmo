# Eternal Shop · Proyecto web

Tienda de ropa ficticia de cuatro vistas (catálogo, búsqueda por SKU, filtros y ranking) y un
laboratorio que mide en vivo la complejidad de los algoritmos. HTML, CSS y JavaScript puros:
no necesita instalar nada ni conexión a internet.

## Cómo abrirlo
Descomprima la carpeta completa y haga doble clic en **`index.html`** (tienda) o en
**`laboratorio.html`**. Funciona en Chrome, Edge, Firefox y Safari, en computador y celular.
Para ver una vista directamente: `index.html?vista=sku&sku=CAM-001`, `?vista=ranking&n=10`,
`?vista=filtros&categoria=Camisas&talla=M&precio=100000&stock=1`.

## Estructura
    index.html            tienda (cuatro vistas)
    laboratorio.html      medición de M1 a M4 en el navegador
    css/estilos.css       estilos de la tienda (móvil primero; se adapta a escritorio)
    css/laboratorio.css   estilos del laboratorio
    js/catalogo.js        catálogo ficticio de 300 productos
    js/algoritmos.js      módulos M1 a M4: consulta por SKU, filtrado, ranking (Merge Sort), duplicados
    js/app.js             interfaz de la tienda
    js/laboratorio.js     generador de catálogos y mediciones
    js/lab_ui.js          tablas y gráficas del laboratorio
    img/logo.svg, favicon.svg, banner.svg
    img/productos/        42 ilustraciones: 6 categorías x 7 colores (ej.: camisas-blanco.svg)
    tests/                pruebas con Node.js (opcional)

## Imágenes
Cada producto usa `img/productos/<categoria>-<color>.svg` en minúsculas y sin tildes. Para usar
fotos reales, reemplace esos archivos conservando el nombre (o cambie la función `imagen()` en
`js/app.js`). El logo, el favicon y el banner están en `img/`.

## Publicarlo en internet
Es un sitio estático: arrastre la carpeta a Netlify Drop, o suba el contenido a GitHub Pages.

## Pruebas (opcional, requiere Node.js)
    node tests/test_interfaz.js
    node tests/test_laboratorio.js

Prototipo académico con datos ficticios. Tecnológico de Antioquia · Ingeniería de Software.
