/* Eternal Shop: interfaz de cuatro vistas (catálogo, SKU, filtros y ranking). */
(function () {
  'use strict';
  var A = EternalAlgoritmos;
  var INDICE = A.construirIndice(CATALOGO);
  var visibles = 8;

  function imagen(p) { return 'img/productos/' + p.categoria.toLowerCase() + '-' + p.color.toLowerCase() + '.svg'; }
  function $(id) { return document.getElementById(id); }
  function pesos(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function param(nombre) {
    var q = window.location.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < q.length; i++) {
      var kv = q[i].split('=');
      if (decodeURIComponent(kv[0]) === nombre) {
        return decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      }
    }
    return '';
  }
  function estado(modulo, complejidad, extra) {
    return '<div class="estado">Módulo ' + modulo + ' · ' + complejidad +
      (extra ? ' · ' + extra : '') + '</div>';
  }
  function tarjeta(p) {
    return '<div class="card"><div class="c-thumb"><img src="' + imagen(p) + '" alt="' + esc(p.nombre) +
      '"></div><div class="c-info"><b>' + esc(p.nombre) + '</b><small>' + p.sku +
      ' · Talla ' + p.talla + ' · ' + p.color + '</small><small>Stock ' + p.stock +
      ' · Ventas ' + p.ventas + '</small></div><div class="c-precio">' + pesos(p.precio) + '</div></div>';
  }
  function opciones(valores, etiqueta) {
    var h = '<option value="">' + etiqueta + '</option>';
    for (var i = 0; i < valores.length; i++) {
      h += '<option value="' + valores[i] + '">' + valores[i] + '</option>';
    }
    return h;
  }
  function valoresUnicos(campo) {
    var vistos = {}, lista = [];
    for (var i = 0; i < CATALOGO.length; i++) {
      var v = CATALOGO[i][campo];
      if (!vistos[v]) { vistos[v] = true; lista.push(v); }
    }
    return lista.sort();
  }

  /* ---------- vistas ---------- */
  function vistaCatalogo() {
    var h = '<div class="banner"><img src="img/banner.svg" alt="Nueva colección"></div><h2>Catálogo</h2><div class="sub">' +
      CATALOGO.length + ' productos</div><div class="lista">';
    for (var i = 0; i < Math.min(visibles, CATALOGO.length); i++) { h += tarjeta(CATALOGO[i]); }
    h += '</div>';
    if (visibles < CATALOGO.length) { h += '<button class="btn sec" id="mas">Ver más</button>'; }
    $('contenido').innerHTML = h +
      estado('Datos', 'catálogo en memoria', CATALOGO.length + ' productos');
    if ($('mas')) { $('mas').onclick = function () { visibles += 8; vistaCatalogo(); }; }
  }

  function vistaSku(valorInicial) {
    $('contenido').innerHTML = '<h2>Búsqueda por SKU</h2>' +
      '<div class="sub">Consulta directa por código (tabla hash)</div>' +
      '<input id="sku" type="text" placeholder="Ejemplo: CAM-001" value="' +
      esc(valorInicial || '') + '"><button class="btn" id="buscar">Buscar</button>' +
      '<div id="res"></div>';
    function buscar() {
      var sku = A.normalizarSku($('sku').value), h = '';
      if (!A.FORMATO_SKU.test(sku)) {
        h = '<div class="msg err">Formato de SKU no válido (ejemplo: CAM-001).</div>';
      } else {
        var p = A.consultarPorSku(INDICE, sku);
        if (!p) { h = '<div class="msg err">SKU no encontrado.</div>'; }
        else {
          h = '<div class="ficha"><div class="f-img"><img src="' + imagen(p) + '" alt="' + esc(p.nombre) + '"></div><h3>' + esc(p.nombre) +
            '</h3><table><tr><td>SKU</td><td>' + p.sku + '</td></tr><tr><td>Categoría' +
            '</td><td>' + p.categoria + '</td></tr><tr><td>Talla / Color</td><td>' +
            p.talla + ' / ' + p.color + '</td></tr><tr><td>Precio</td><td>' +
            pesos(p.precio) + '</td></tr><tr><td>Stock</td><td>' + p.stock +
            ' unidades</td></tr><tr><td>Ventas</td><td>' + p.ventas +
            '</td></tr></table></div>';
        }
      }
      $('res').innerHTML = h + estado('M1', 'O(1)', '1 acceso directo');
    }
    $('buscar').onclick = buscar;
    if (valorInicial) { buscar(); }
  }

  function vistaFiltros(ini) {
    ini = ini || {};
    $('contenido').innerHTML = '<h2>Filtros</h2>' +
      '<div class="sub">Recorrido del catálogo (O(n))</div>' +
      '<select id="fcat">' + opciones(valoresUnicos('categoria'), 'Categoría') + '</select>' +
      '<select id="ftalla">' + opciones(valoresUnicos('talla'), 'Talla') + '</select>' +
      '<select id="fcolor">' + opciones(valoresUnicos('color'), 'Color') + '</select>' +
      '<label class="lbl">Precio máximo: <input id="fprecio" type="number" min="0" ' +
      'step="1000" placeholder="Sin límite"></label><label class="chk">' +
      '<input id="fstock" type="checkbox"> Solo disponibles (stock &gt; 0)</label>' +
      '<div id="res"></div>';
    $('fcat').value = ini.categoria || ''; $('ftalla').value = ini.talla || '';
    $('fcolor').value = ini.color || ''; $('fprecio').value = ini.precio || '';
    $('fstock').checked = !!ini.stock;
    function aplicar() {
      var pm = $('fprecio').value, h;
      if (pm !== '' && (isNaN(Number(pm)) || Number(pm) < 0)) {
        $('res').innerHTML =
          '<div class="msg err">El precio máximo debe ser un número no negativo.</div>';
        return;
      }
      var r = A.filtrar(CATALOGO, { categoria: $('fcat').value, talla: $('ftalla').value,
        color: $('fcolor').value, precioMax: pm === '' ? null : Number(pm),
        soloDisponibles: $('fstock').checked });
      if (r.length === 0) {
        h = '<div class="msg">Sin resultados para los filtros indicados.</div>';
      } else {
        h = '<div class="cuenta">' + r.length + ' resultado' + (r.length === 1 ? '' : 's') +
          '</div>';
        h += '<div class="lista">';
        for (var i = 0; i < Math.min(r.length, 4); i++) { h += tarjeta(r[i]); }
        h += '</div>';
        if (r.length > 4) { h += '<div class="sub">… y ' + (r.length - 4) + ' más</div>'; }
      }
      $('res').innerHTML = h + estado('M2', 'O(n)', CATALOGO.length + ' productos evaluados');
    }
    var ids = ['fcat', 'ftalla', 'fcolor', 'fprecio', 'fstock'];
    for (var i = 0; i < ids.length; i++) { $(ids[i]).onchange = aplicar; }
    aplicar();
  }

  function vistaRanking(nInicial) {
    $('contenido').innerHTML = '<h2>Ranking de ventas</h2>' +
      '<div class="sub">Merge Sort estable (O(n log n))</div><label class="lbl">' +
      'Mostrar los primeros <select id="rn"><option>5</option><option>10</option>' +
      '<option>20</option></select> productos</label><div id="res"></div>';
    $('rn').value = String(nInicial || 5);
    function ver() {
      var n = parseInt($('rn').value, 10), r = A.rankingVentas(CATALOGO, n), h = '';
      var max = r[0].ventas || 1;
      for (var i = 0; i < r.length; i++) {
        h += '<div class="rk"><div class="rk-n">' + (i + 1) + '</div><div class="rk-i"><img src="' + imagen(r[i]) + '" alt=""></div><div class="rk-b">' +
          '<div class="rk-t"><b>' + esc(r[i].nombre) + '</b> <small>' + r[i].sku +
          '</small></div><div class="barra"><span style="width:' +
          Math.round(100 * r[i].ventas / max) + '%"></span></div></div><div class="rk-v">' +
          r[i].ventas + '</div></div>';
      }
      $('res').innerHTML = h + estado('M3', 'O(n log n)', CATALOGO.length + ' productos ordenados');
    }
    $('rn').onchange = ver; ver();
  }

  /* ---------- navegación ---------- */
  function mostrar(vista, ini) {
    var botones = document.getElementsByClassName('tab');
    for (var i = 0; i < botones.length; i++) {
      botones[i].className = 'tab' +
        (botones[i].getAttribute('data-vista') === vista ? ' activa' : '');
    }
    if (vista === 'catalogo') { vistaCatalogo(); }
    else if (vista === 'sku') { vistaSku(ini && ini.sku); }
    else if (vista === 'filtros') { vistaFiltros(ini); }
    else { vistaRanking(ini && ini.n); }
  }
  var tabs = document.getElementsByClassName('tab');
  for (var k = 0; k < tabs.length; k++) {
    tabs[k].onclick = function () { mostrar(this.getAttribute('data-vista')); };
  }
  mostrar(param('vista') || 'catalogo', { sku: param('sku'), categoria: param('categoria'),
    talla: param('talla'), color: param('color'), precio: param('precio'),
    stock: param('stock'), n: param('n') });
})();
