/* Pruebas de la lógica JavaScript: paridad con Python y casos borde.
   Ejecutar desde la carpeta raíz: node pruebas/test_interfaz.js */
var fs = require('fs'), path = require('path'), assert = require('assert');
var base = path.join(__dirname, '..', 'js');
eval(fs.readFileSync(path.join(base, 'catalogo.js'), 'utf8')
  .replace('var CATALOGO', 'global.CATALOGO'));
var A = require(path.join(base, 'algoritmos.js'));
var esperado = JSON.parse(fs.readFileSync(path.join(__dirname, 'esperado.json'), 'utf8'));
var pruebas = 0;
function prueba(nombre, fn) { fn(); pruebas++; console.log('  ok  ' + nombre); }
function skus(l) { return l.map(function (p) { return p.sku; }); }

prueba('el catálogo tiene 300 productos y el primero es CAM-001', function () {
  assert.strictEqual(CATALOGO.length, 300);
  assert.strictEqual(CATALOGO[0].sku, 'CAM-001');
});
prueba('M1: consulta por SKU coincide con Python', function () {
  var idx = A.construirIndice(CATALOGO);
  assert.deepStrictEqual(A.consultarPorSku(idx, 'CAM-001'), esperado.consulta_cam001);
  assert.strictEqual(A.consultarPorSku(idx, 'XXX-999'), null);
  assert.strictEqual(A.consultarPorSku(idx, 'constructor'), null);
});
prueba('M2: filtros coinciden con Python', function () {
  assert.deepStrictEqual(skus(A.filtrar(CATALOGO, { categoria: 'Camisas',
    precioMax: 100000, soloDisponibles: true })), esperado.filtro_camisas_100000_stock);
  assert.deepStrictEqual(skus(A.filtrar(CATALOGO, { categoria: 'Zapatos', talla: '40' })),
    esperado.filtro_zapatos_talla40);
  assert.deepStrictEqual(skus(A.filtrar(CATALOGO, { color: 'Negro', precioMax: 80000 })),
    esperado.filtro_negro_menor_80000);
  assert.strictEqual(A.filtrar(CATALOGO, {}).length, 300);
});
prueba('M3: ranking (Merge Sort estable) coincide con Python', function () {
  assert.deepStrictEqual(skus(A.rankingVentas(CATALOGO, 20)), esperado.ranking20);
});
prueba('M3: coincide con Array.sort estable de JavaScript', function () {
  var ref = CATALOGO.slice().sort(function (a, b) { return b.ventas - a.ventas; });
  var obtenido = A.mergeSort(CATALOGO, function (p) { return p.ventas; });
  assert.deepStrictEqual(skus(obtenido), skus(ref));
});
prueba('M3: casos borde (vacío, un elemento, empates)', function () {
  var c = function (x) { return x.v; };
  assert.deepStrictEqual(A.mergeSort([], c), []);
  assert.deepStrictEqual(A.mergeSort([{ v: 1 }], c), [{ v: 1 }]);
  var l = [{ id: 0, v: 5 }, { id: 1, v: 9 }, { id: 2, v: 5 }, { id: 3, v: 9 }];
  assert.deepStrictEqual(A.mergeSort(l, c).map(function (x) { return x.id; }),
    [1, 3, 0, 2]);
});
prueba('M4: duplicados coinciden con Python y detecta repetidos', function () {
  assert.deepStrictEqual(A.buscarDuplicados(CATALOGO), esperado.duplicados);
  var con = CATALOGO.concat([CATALOGO[5], CATALOGO[5]]);
  assert.deepStrictEqual(A.buscarDuplicados(con), [CATALOGO[5].sku, CATALOGO[5].sku]);
});
prueba('validación de SKU', function () {
  assert.ok(A.FORMATO_SKU.test(A.normalizarSku('  cam-001 ')));
  ['', null, '123', 'CAM001', 'cam-1', 'CAM-001; DROP'].forEach(function (s) {
    assert.ok(!A.FORMATO_SKU.test(A.normalizarSku(s)), String(s));
  });
});
console.log(pruebas + ' pruebas JavaScript superadas');
