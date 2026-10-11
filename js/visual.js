/* visual.js: hình minh họa đúng số lượng — nhóm đồ vật và bảng chấm hàng/cột. */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};
  var h = function () { return TT.ui.h.apply(null, arguments); };

  /* Nhóm đồ vật: b nhóm, mỗi nhóm a đồ vật (đúng quy ước a × b = a được lấy b lần).
   * opts: {ctx, highlight:[{from,to,cls}], ghost, badges(bool), tapCount(fn), container:'box'|'tree'|'tray'} */
  function groups(fact, opts) {
    opts = opts || {};
    var ctx = opts.ctx || TT.art.CONTEXTS[0];
    var a = fact.a, b = fact.b;
    var wrap = h('div', { class: 'groups' + (b > 6 ? ' many' : '') + (a > 6 ? ' big' : '') });
    var legend = h('div', { class: 'groups-legend' }, [
      h('span', { class: 'chip chip-g', text: 'Số ' + ctx.group + ': ' + b }),
      h('span', { class: 'chip chip-i', text: 'Mỗi ' + ctx.group + ': ' + a + ' ' + ctx.unit })
    ]);
    wrap.appendChild(legend);
    var grid = h('div', { class: 'groups-grid' });
    var total = b + (opts.ghost || 0);
    for (var g = 0; g < total; g++) {
      var ghost = g >= b;
      var cls = 'group ' + (opts.container || 'box') + (ghost ? ' ghost' : '');
      (opts.highlight || []).forEach(function (hl) { if (g >= hl.from && g <= hl.to) cls += ' ' + hl.cls; });
      var grp = h('div', { class: cls, 'data-g': g });
      var items = h('div', { class: 'items n' + a });
      for (var i = 0; i < a; i++) items.insertAdjacentHTML('beforeend', TT.art.obj(ctx.icon));
      grp.appendChild(items);
      var badgeText = '';
      if (opts.badges && !ghost) {
        var show = b <= 5 || b === 10 ? true : (b === 9 ? false : (g === 4 || g === b - 1));
        if (show) badgeText = String(a * (g + 1));
      }
      if (ghost) badgeText = '10 nhóm = ' + (a * 10);
      grp.appendChild(h('div', { class: 'badge' + (badgeText ? '' : ' empty'), text: badgeText || ' ' }));
      if (opts.tapCount && !ghost) {
        grp.setAttribute('role', 'button');
        grp.setAttribute('tabindex', '0');
        grp.setAttribute('aria-label', ctx.group + ' thứ ' + (g + 1));
        (function (idx, el) {
          var fire = function () { opts.tapCount(idx, el); };
          el.addEventListener('click', fire);
          el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
        })(g, grp);
      }
      grid.appendChild(grp);
    }
    wrap.appendChild(grid);
    return wrap;
  }

  /* Bảng chấm: rows hàng × cols cột. */
  function dots(rows, cols, color) {
    var wrap = h('div', { class: 'dots', style: '--cols:' + cols });
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        wrap.appendChild(h('span', { class: 'dot' + (color ? ' ' + color : '') }));
      }
    }
    return wrap;
  }

  /* Đống đồ vật rời (dùng cho phép chia): đúng c đồ vật */
  function pile(count, icon) {
    var wrap = h('div', { class: 'pile' });
    for (var i = 0; i < count; i++) wrap.insertAdjacentHTML('beforeend', TT.art.obj(icon));
    return wrap;
  }

  /* Gợi ý: hình nhóm + (tuỳ chọn) các bước giải khớp với tô màu */
  function hintPanel(fact, ctx, stepMode) {
    var ex = TT.engine.explain(fact);
    var useCtx = fact.op === 'div' ? { group: 'khay', unit: 'cái bánh', icon: 'cookie' } : ctx;
    var panel = h('div', { class: 'hint-panel' + (stepMode ? ' steps-mode' : '') });
    panel.appendChild(groups(fact, {
      ctx: useCtx,
      highlight: stepMode ? ex.highlight : [],
      ghost: stepMode ? ex.ghost : 0,
      badges: stepMode,
      container: fact.op === 'div' ? 'tray' : 'box'
    }));
    if (stepMode) {
      var ol = h('ol', { class: 'steps' });
      ex.steps.forEach(function (s) { ol.appendChild(h('li', { text: s })); });
      panel.appendChild(ol);
    } else {
      var a = fact.a, b = fact.b;
      var txt = fact.op === 'div'
        ? 'Mỗi khay ' + a + ' cái. Đếm xem cần mấy khay để xếp hết ' + fact.c + ' cái nhé.'
        : 'Có ' + b + ' nhóm, mỗi nhóm ' + a + '. Con đếm thêm ' + a + ' cho mỗi nhóm nhé.';
      panel.appendChild(h('p', { class: 'hint-text', text: txt }));
    }
    return panel;
  }

  TT.visual = { groups: groups, dots: dots, pile: pile, hintPanel: hintPanel };
})(window);
