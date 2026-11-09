/* Pruebas del laboratorio de complejidad. Ejecutar desde la carpeta raíz: node pruebas/test_laboratorio.js */
var fs = require('fs'), path = require('path'), assert = require('assert');
var base = path.join(__dirname, '..', 'js');
eval(fs.readFileSync(path.join(base, 'catalogo.js'), 'utf8').replace('var CATALOGO', 'global.CATALOGO'));
var A = require(path.join(base, 'algoritmos.js'));
var esperado = JSON.parse(fs.readFileSync(path.join(__dirname, 'esperado.json'), 'utf8'));
var pruebas = 0;
function prueba(nombre, fn) { fn(); pruebas++; console.log('  ok  ' + nombre); }
function skus(l) { return l.map(function (p) { return p.sku; }); }

prueba('conteo de comparaciones de Merge Sort y de pares coincide con Python', function () {
  var r = A.mergeSortContando(CATALOGO, function (p) { return p.ventas; });
  assert.strictEqual(r.comparaciones, esperado.comparaciones_ranking);
  assert.deepStrictEqual(skus(r.lista.slice(0, 20)), esperado.ranking20);
  var d = A.buscarDuplicadosPares(CATALOGO);
  assert.strictEqual(d.comparaciones, esperado.comparaciones_pares);
  assert.deepStrictEqual(d.duplicados, []);
  var con = CATALOGO.concat([CATALOGO[5]]);
  assert.deepStrictEqual(A.buscarDuplicadosPares(con).duplicados, [CATALOGO[5].sku]);
});
prueba('laboratorio: generador reproducible y cotas teóricas', function () {
  var Lab = require(path.join(base, 'laboratorio.js'));
  assert.deepStrictEqual(Lab.generar(500, 42), Lab.generar(500, 42));
  assert.notDeepStrictEqual(Lab.generar(500, 42), Lab.generar(500, 43));
  var cat = Lab.generar(4096, 42), skusU = {};
  cat.forEach(function (p) { skusU[p.sku] = 1; });
  assert.strictEqual(Object.keys(skusU).length, 4096);
  var c = A.mergeSortContando(cat, function (p) { return p.ventas; }).comparaciones;
  assert.ok(c <= 4096 * 12 && c >= 4096 / 2 * 12, 'comparaciones fuera de cotas: ' + c);
  var m = Lab.medir(1000, 2), mp = Lab.medirPares(200);
  assert.ok(m.m1Us >= 0 && m.m3Ms >= 0 && m.comparaciones > 0);
  assert.strictEqual(mp.comparaciones, 200 * 199 / 2);
});
console.log(pruebas + ' pruebas del laboratorio superadas');
