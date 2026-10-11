/* ui.js: tiện ích giao diện nhỏ (tạo phần tử, thông báo, hộp thoại NPC, xác nhận). */
(function (root) {
  'use strict';
  var TT = root.TT = root.TT || {};

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* Nút chống bấm liên tục: mỗi lần chạm chỉ xử lý một lần trong khoảng ngắn */
  function btn(label, cls, onClick, extra) {
    var attrs = Object.assign({ type: 'button', class: 'btn ' + (cls || '') }, extra || {});
    var b = h('button', attrs);
    if (typeof label === 'string') b.textContent = label; else if (label) b.appendChild(label);
    var busy = false;
    b.addEventListener('click', function (e) {
      if (busy || b.disabled) return;
      busy = true; setTimeout(function () { busy = false; }, 350);
      TT.audio.play('tap');
      onClick && onClick(e);
    });
    return b;
  }

  function iconBtn(iconName, label, onClick, cls) {
    var b = btn(null, 'icon-btn ' + (cls || ''), onClick, { 'aria-label': label, title: label });
    b.innerHTML = TT.art.icon(iconName) + '<span class="sr">' + label + '</span>';
    return b;
  }

  var toastTimer = null;
  function toast(msg, ms) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  }

  /* Hộp thoại kiểu truyện tranh cho NPC. actions: [{label, cls, fn}] */
  function say(speaker, avatarHTML, text, actions) {
    closeModal();
    var root = document.getElementById('modal-root');
    var box = h('div', { class: 'dialog-wrap', role: 'dialog', 'aria-label': 'Lời thoại của ' + speaker });
    var card = h('div', { class: 'dialog' }, [
      h('div', { class: 'dialog-avatar', html: avatarHTML }),
      h('div', { class: 'dialog-body' }, [
        h('div', { class: 'dialog-name', text: speaker }),
        h('p', { class: 'dialog-text', text: text })
      ])
    ]);
    var row = h('div', { class: 'dialog-actions' });
    (actions || []).forEach(function (a) {
      row.appendChild(btn(a.label, a.cls || 'primary', function () { closeModal(); a.fn && a.fn(); }));
    });
    row.appendChild(btn('Đóng', 'ghost', closeModal));
    card.querySelector('.dialog-body').appendChild(row);
    box.appendChild(card);
    box.addEventListener('click', function (e) { if (e.target === box) closeModal(); });
    root.appendChild(box);
    var first = row.querySelector('button'); if (first) first.focus({ preventScroll: true });
  }

  function modal(contentEl, opts) {
    closeModal();
    opts = opts || {};
    var root = document.getElementById('modal-root');
    var wrap = h('div', { class: 'modal-wrap', role: 'dialog', 'aria-modal': 'true' });
    var card = h('div', { class: 'modal ' + (opts.cls || '') }, [contentEl]);
    wrap.appendChild(card);
    if (opts.dismiss !== false) wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    root.appendChild(wrap);
    var f = card.querySelector('button, input'); if (f) f.focus({ preventScroll: true });
    return wrap;
  }

  function closeModal() {
    var root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  }

  function confirmBox(title, text, okLabel, onOk) {
    var c = h('div', { class: 'confirm' }, [h('h2', { text: title }), h('p', { text: text })]);
    var row = h('div', { class: 'row-actions' }, [
      btn('Không, giữ lại', 'ghost', closeModal),
      btn(okLabel, 'danger', function () { closeModal(); onOk(); })
    ]);
    c.appendChild(row);
    modal(c);
  }

  function prefersReducedMotion() {
    var p = TT.store && TT.store.profile();
    if (p && p.settings.reducedMotion) return true;
    return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  TT.ui = { h: h, btn: btn, iconBtn: iconBtn, toast: toast, say: say, modal: modal, closeModal: closeModal,
    confirmBox: confirmBox, reducedMotion: prefersReducedMotion };
})(window);
