/* Eternal Shop: módulos M1 a M4 en JavaScript (igual diseño que algoritmos.py) */
var EternalAlgoritmos = (function () {
  'use strict';
  var tiene = Object.prototype.hasOwnProperty;

  /* M1: consulta por SKU, O(1). El índice se construye una vez: O(n). */
  function construirIndice(catalogo) {
    var indice = {};
    for (var i = 0; i < catalogo.length; i++) {
      indice[catalogo[i].sku] = catalogo[i];
    }
    return indice;
  }
  function consultarPorSku(indice, sku) {
    return tiene.call(indice, sku) ? indice[sku] : null;
  }

  /* M2: filtrado, O(n). Conserva los que cumplen TODAS las condiciones. */
  function filtrar(catalogo, f) {
    var resultado = [];
    for (var i = 0; i < catalogo.length; i++) {
      var p = catalogo[i];
      if (f.categoria && p.categoria !== f.categoria) { continue; }
      if (f.talla && p.talla !== f.talla) { continue; }
      if (f.color && p.color !== f.color) { continue; }
      if (f.precioMax !== null && f.precioMax !== undefined &&
          p.precio > f.precioMax) { continue; }
      if (f.soloDisponibles && p.stock <= 0) { continue; }
      resultado.push(p);
    }
    return resultado;
  }

  /* M3: ranking con Merge Sort (estable, descendente), O(n log n). */
  function mezclar(izq, der, clave) {
    var resultado = [], i = 0, j = 0;
    while (i < izq.length && j < der.length) {
      if (clave(izq[i]) >= clave(der[j])) { resultado.push(izq[i]); i++; }
      else { resultado.push(der[j]); j++; }
    }
    while (i < izq.length) { resultado.push(izq[i]); i++; }
    while (j < der.length) { resultado.push(der[j]); j++; }
    return resultado;
  }
  function mergeSort(lista, clave) {
    if (lista.length <= 1) { return lista.slice(); }
    var mitad = Math.floor(lista.length / 2);
    return mezclar(mergeSort(lista.slice(0, mitad), clave),
                   mergeSort(lista.slice(mitad), clave), clave);
  }
  function rankingVentas(catalogo, nTop) {
    return mergeSort(catalogo, function (p) { return p.ventas; }).slice(0, nTop);
  }

  /* M4: duplicados con conjunto hash, O(n). */
  function buscarDuplicados(catalogo) {
    var vistos = {}, duplicados = [];
    for (var i = 0; i < catalogo.length; i++) {
      var sku = catalogo[i].sku;
      if (tiene.call(vistos, sku)) { duplicados.push(sku); }
      else { vistos[sku] = true; }
    }
    return duplicados;
  }


  /* Variantes que cuentan comparaciones de claves (evidencia independiente del hardware). */
  function mezclarContando(izq, der, clave, c) {
    var resultado = [], i = 0, j = 0;
    while (i < izq.length && j < der.length) {
      c.n++;
      if (clave(izq[i]) >= clave(der[j])) { resultado.push(izq[i]); i++; }
      else { resultado.push(der[j]); j++; }
    }
    while (i < izq.length) { resultado.push(izq[i]); i++; }
    while (j < der.length) { resultado.push(der[j]); j++; }
    return resultado;
  }
  function ordenarContando(lista, clave, c) {
    if (lista.length <= 1) { return lista.slice(); }
    var mitad = Math.floor(lista.length / 2);
    return mezclarContando(ordenarContando(lista.slice(0, mitad), clave, c),
                           ordenarContando(lista.slice(mitad), clave, c), clave, c);
  }
  function mergeSortContando(lista, clave) {
    var c = { n: 0 };
    var ordenada = ordenarContando(lista, clave, c);
    return { lista: ordenada, comparaciones: c.n };
  }

  /* Referencia ineficiente O(n^2): compara todos los pares de SKU. */
  function buscarDuplicadosPares(catalogo) {
    var repetidos = {}, lista = [], comparaciones = 0;
    for (var i = 0; i < catalogo.length; i++) {
      for (var j = i + 1; j < catalogo.length; j++) {
        comparaciones++;
        if (catalogo[i].sku === catalogo[j].sku && !tiene.call(repetidos, catalogo[i].sku)) {
          repetidos[catalogo[i].sku] = true; lista.push(catalogo[i].sku);
        }
      }
    }
    return { duplicados: lista, comparaciones: comparaciones };
  }

  /* Validación de entradas (misma regla que controlador.py). */
  var FORMATO_SKU = /^[A-Z]{3}-\d{3,}$/;
  function normalizarSku(texto) {
    var t = (texto === null || texto === undefined) ? '' : String(texto);
    return t.replace(/^\s+|\s+$/g, '').toUpperCase();
  }

  return {
    construirIndice: construirIndice, consultarPorSku: consultarPorSku,
    filtrar: filtrar, mergeSort: mergeSort, rankingVentas: rankingVentas,
    buscarDuplicados: buscarDuplicados, mergeSortContando: mergeSortContando,
    buscarDuplicadosPares: buscarDuplicadosPares, FORMATO_SKU: FORMATO_SKU,
    normalizarSku: normalizarSku
  };
})();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EternalAlgoritmos;
}
