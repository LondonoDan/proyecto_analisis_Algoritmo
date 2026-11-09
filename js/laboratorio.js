/* Eternal Shop - Laboratorio de complejidad: genera catálogos y mide M1 a M4 en el navegador. */
var EternalLab = (function (A) {
  'use strict';
  var CATS = [['CAM', 55000, 140000], ['CMT', 29000, 79000], ['PAN', 79000, 220000],
              ['CHA', 150000, 420000], ['VES', 90000, 280000], ['ZAP', 110000, 350000]];

  /* Generador congruencial lineal (aritmética exacta en doubles); misma semilla, mismos datos. */
  function azar(semilla) {
    var s = semilla % 4294967296;
    return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }
  function entero(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  function generar(n, semilla) {
    var r = azar(semilla === undefined ? 42 : semilla), lista = [];
    for (var i = 1; i <= n; i++) {
      var c = CATS[entero(r, 0, CATS.length - 1)], num = String(i);
      while (num.length < 3) { num = '0' + num; }
      lista.push({ sku: c[0] + '-' + num, categoria: c[0],
                   precio: Math.round(entero(r, c[1], c[2]) / 100) * 100,
                   stock: entero(r, 0, 100), ventas: entero(r, 0, 500) });
    }
    return lista;
  }

  function ahora() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function mediana(v) { var a = v.slice().sort(function (x, y) { return x - y; }); return a[Math.floor(a.length / 2)]; }
  /* Mediana del tiempo por ejecución. Si la operación es muy breve, la repite en lotes hasta
     acumular unos 4 ms, para que la resolución del reloj del navegador no distorsione el dato. */
  function repetir(fn, veces) {
    var lote = 1, d, j, a;
    for (;;) {
      a = ahora(); for (j = 0; j < lote; j++) { fn(); } d = ahora() - a;
      if (d >= 4 || lote >= 4096) { break; }
      lote *= 2;
    }
    var t = [d / lote];
    for (var k = 1; k < veces; k++) {
      a = ahora(); for (j = 0; j < lote; j++) { fn(); } t.push((ahora() - a) / lote);
    }
    return mediana(t);
  }

  /* Mide M1 a M4 con un catálogo de n productos. */
  function medir(n, repeticiones) {
    repeticiones = repeticiones || 5;
    var cat = generar(n, 42), indice = A.construirIndice(cat), consultas = 200000, k, t0;
    var skus = [], r = azar(7);
    for (k = 0; k < consultas; k++) { skus.push(cat[Math.floor(r() * n)].sku); }
    t0 = ahora();
    for (k = 0; k < consultas; k++) { A.consultarPorSku(indice, skus[k]); }
    var m1Us = (ahora() - t0) / consultas * 1000;
    var m2 = repetir(function () { A.filtrar(cat, { categoria: 'CAM', precioMax: 100000, soloDisponibles: true }); }, repeticiones);
    var m3 = repetir(function () { A.rankingVentas(cat, 10); }, repeticiones);
    var m4 = repetir(function () { A.buscarDuplicados(cat); }, repeticiones);
    var cont = A.mergeSortContando(cat, function (p) { return p.ventas; }).comparaciones;
    return { n: n, m1Us: m1Us, m2Ms: m2, m3Ms: m3, m4Ms: m4, comparaciones: cont,
             nLog2n: n * Math.log(n) / Math.LN2 };
  }

  /* Contrasta M4 (conjunto hash) con la comparación por pares. */
  function medirPares(n) {
    var cat = generar(n, 42), res;
    var m4 = repetir(function () { A.buscarDuplicados(cat); }, 5);
    var pares = repetir(function () { res = A.buscarDuplicadosPares(cat); }, 3);
    return { n: n, m4Ms: m4, paresMs: pares, comparaciones: res.comparaciones };
  }

  return { generar: generar, medir: medir, medirPares: medirPares, azar: azar };
})(typeof EternalAlgoritmos !== 'undefined' ? EternalAlgoritmos : require('./algoritmos.js'));
if (typeof module !== 'undefined' && module.exports) { module.exports = EternalLab; }
