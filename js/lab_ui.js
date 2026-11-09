/* Eternal Shop - Laboratorio: interfaz de la medición en vivo (ES5). */
(function () {
  'use strict';
  var L = EternalLab, serie = [], pares = [];
  var COLORES = { m1: '#548235', m2: '#2e75b6', m3: '#1f3864', m4: '#7f7f7f', pares: '#c55a11' };

  function $(id) { return document.getElementById(id); }
  function num(x, d) {
    var s = x.toFixed(d), p = s.split('.'), ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return p.length > 1 ? ent + ',' + p[1] : ent;
  }
  function ms(x) { return x < 0.01 ? '< 0,01' : num(x, x >= 100 ? 1 : 3); }
  function param(nombre) {
    var q = window.location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < q.length; i++) { var kv = q[i].split('='); if (kv[0] === nombre) { return kv[1] || ''; } }
    return '';
  }

  /* ----- gráfica logarítmica en canvas ----- */
  function grafica(id, xs, lineas, etiquetaY) {
    var cv = $(id), g = cv.getContext('2d'), W = cv.width, H = cv.height;
    var mi = 56, md = 36, ms_ = 16, mb = 40, i, j;
    g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    var ymin = Infinity, ymax = 0;
    for (i = 0; i < lineas.length; i++) for (j = 0; j < lineas[i].y.length; j++) {
      var v = lineas[i].y[j]; if (v > 0) { ymin = Math.min(ymin, v); ymax = Math.max(ymax, v); }
    }
    if (!isFinite(ymin)) { return; }
    var ly0 = Math.floor(Math.log(ymin) / Math.LN10), ly1 = Math.ceil(Math.log(ymax) / Math.LN10);
    if (ly1 === ly0) { ly1 = ly0 + 1; }
    var lx0 = Math.log(xs[0]) / Math.LN10, lx1 = Math.log(xs[xs.length - 1]) / Math.LN10;
    function px(x) { return mi + (Math.log(x) / Math.LN10 - lx0) / (lx1 - lx0 || 1) * (W - mi - md); }
    function py(y) { return ms_ + (1 - (Math.log(y) / Math.LN10 - ly0) / (ly1 - ly0)) * (H - ms_ - mb); }
    g.font = '12px Arial'; g.textAlign = 'right'; g.fillStyle = '#555'; g.strokeStyle = '#e2e6ee'; g.lineWidth = 1;
    for (i = ly0; i <= ly1; i++) {
      var yy = py(Math.pow(10, i)); g.beginPath(); g.moveTo(mi, yy); g.lineTo(W - md, yy); g.stroke();
      g.fillText('10' + (i < 0 ? '^' + i : '^' + i), mi - 6, yy + 4);
    }
    g.textAlign = 'center';
    for (i = 0; i < xs.length; i++) {
      var xx = px(xs[i]); g.beginPath(); g.moveTo(xx, ms_); g.lineTo(xx, H - mb); g.stroke();
      g.fillText(num(xs[i], 0), xx, H - mb + 16);
    }
    g.fillStyle = '#333'; g.fillText('Número de productos (n)', (mi + W - md) / 2, H - 6);
    g.save(); g.translate(14, (ms_ + H - mb) / 2); g.rotate(-Math.PI / 2); g.fillText(etiquetaY, 0, 0); g.restore();
    for (i = 0; i < lineas.length; i++) {
      g.strokeStyle = lineas[i].color; g.fillStyle = lineas[i].color; g.lineWidth = 2.5; g.beginPath();
      var primero = true;
      for (j = 0; j < lineas[i].y.length; j++) {
        if (!(lineas[i].y[j] > 0)) { continue; }
        var X = px(xs[j]), Y = py(lineas[i].y[j]);
        if (primero) { g.moveTo(X, Y); primero = false; } else { g.lineTo(X, Y); }
      }
      g.stroke();
      for (j = 0; j < lineas[i].y.length; j++) {
        if (lineas[i].y[j] > 0) { g.beginPath(); g.arc(px(xs[j]), py(lineas[i].y[j]), 4, 0, 6.2832); g.fill(); }
      }
    }
    g.textAlign = 'left'; g.font = 'bold 13px Arial';
    for (i = 0; i < lineas.length; i++) {
      g.fillStyle = lineas[i].color; g.fillRect(mi + 10, ms_ + 8 + i * 20, 14, 4);
      g.fillStyle = '#222'; g.fillText(lineas[i].nombre, mi + 30, ms_ + 14 + i * 20);
    }
  }

  function ordenar(lista) { return lista.slice().sort(function (a, b) { return a.n - b.n; }); }

  function pintarSerie() {
    var d = ordenar(serie), h = '', i;
    for (i = 0; i < d.length; i++) {
      h += '<tr><td>' + num(d[i].n, 0) + '</td><td>' + num(d[i].m1Us, 3) + '</td><td>' + ms(d[i].m2Ms) + '</td><td>' + ms(d[i].m3Ms) +
        '</td><td>' + ms(d[i].m4Ms) + '</td><td>' + num(d[i].comparaciones, 0) + '</td><td>' + num(d[i].comparaciones / d[i].nLog2n * 100, 0) + ' %</td></tr>';
    }
    $('tbody1').innerHTML = h;
    if (d.length > 0) {
      var xs = [], a = [], b = [], c = [], e = [];
      for (i = 0; i < d.length; i++) { xs.push(d[i].n); a.push(d[i].m1Us / 1000); b.push(d[i].m2Ms); c.push(d[i].m3Ms); e.push(d[i].m4Ms); }
      if (xs.length === 1) { xs.push(xs[0] * 10); a.push(0); b.push(0); c.push(0); e.push(0); }
      grafica('g1', xs, [{ nombre: 'M3 ranking, O(n log n)', color: COLORES.m3, y: c }, { nombre: 'M4 duplicados, O(n)', color: COLORES.m4, y: e },
        { nombre: 'M2 filtrado, O(n)', color: COLORES.m2, y: b }, { nombre: 'M1 consulta (por consulta), O(1)', color: COLORES.m1, y: a }], 'Tiempo (ms)');
    }
  }
  function pintarPares() {
    var d = ordenar(pares), h = '', i, xs = [], a = [], b = [];
    for (i = 0; i < d.length; i++) {
      h += '<tr><td>' + num(d[i].n, 0) + '</td><td>' + ms(d[i].m4Ms) + '</td><td>' + ms(d[i].paresMs) + '</td><td>' + num(d[i].comparaciones, 0) +
        '</td><td>' + num(d[i].paresMs / Math.max(d[i].m4Ms, 0.0001), 0) + '×</td></tr>';
      xs.push(d[i].n); a.push(d[i].m4Ms); b.push(d[i].paresMs);
    }
    $('tbody2').innerHTML = h;
    if (xs.length > 1) { grafica('g2', xs, [{ nombre: 'Comparación por pares, O(n²)', color: COLORES.pares, y: b }, { nombre: 'M4 conjunto hash, O(n)', color: COLORES.m3, y: a }], 'Tiempo (ms)'); }
  }

  function ocupado(si, texto) {
    var b = document.getElementsByTagName('button');
    for (var i = 0; i < b.length; i++) { b[i].disabled = si; }
    $('estado').innerHTML = si ? texto : '';
  }
  /* Ejecuta una cola de tareas dejando respirar al navegador entre una y otra. */
  function cola(tareas, mensaje, fin) {
    var k = 0;
    function paso() {
      if (k >= tareas.length) { ocupado(false); if (fin) { fin(); } return; }
      ocupado(true, mensaje + ' (' + (k + 1) + ' de ' + tareas.length + ')…');
      setTimeout(function () { tareas[k](); k++; paso(); }, 30);
    }
    paso();
  }
  function medirN(n) {
    return function () {
      var r = L.medir(n, 5), nuevo = [];
      for (var i = 0; i < serie.length; i++) { if (serie[i].n !== n) { nuevo.push(serie[i]); } }
      nuevo.push(r); serie = nuevo; pintarSerie();
    };
  }
  function medirPar(n) {
    return function () {
      var r = L.medirPares(n), nuevo = [];
      for (var i = 0; i < pares.length; i++) { if (pares[i].n !== n) { nuevo.push(pares[i]); } }
      nuevo.push(r); pares = nuevo; pintarPares();
    };
  }
  var TAM = [100, 1000, 10000, 100000], TAMP = [100, 500, 1000, 2000, 4000], i;
  for (i = 0; i < TAM.length; i++) {
    (function (n) { $('b' + n).onclick = function () { cola([medirN(n)], 'Midiendo n = ' + num(n, 0)); }; })(TAM[i]);
  }
  $('bserie').onclick = function () { var t = []; for (var k = 0; k < TAM.length; k++) { t.push(medirN(TAM[k])); } cola(t, 'Serie completa'); };
  $('bpares').onclick = function () { var t = []; for (var k = 0; k < TAMP.length; k++) { t.push(medirPar(TAMP[k])); } cola(t, 'Comparación por pares'); };
  $('blimpiar').onclick = function () {
    serie = []; pares = []; pintarSerie(); pintarPares();
    $('g1').getContext('2d').clearRect(0, 0, 900, 380); $('g2').getContext('2d').clearRect(0, 0, 900, 340);
  };
  if (param('auto') === '1') {
    var t = [], k;
    for (k = 0; k < TAM.length; k++) { t.push(medirN(TAM[k])); }
    for (k = 0; k < TAMP.length; k++) { t.push(medirPar(TAMP[k])); }
    cola(t, 'Medición automática');
  }
})();
