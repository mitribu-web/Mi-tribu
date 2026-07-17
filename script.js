// ============ MOBILE NAV ============
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const panel = document.querySelector('.mobile-panel');
  if (burger && panel) {
    burger.addEventListener('click', () => {
      panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', panel.classList.contains('open'));
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));
  }

  // ============ REVEAL ON SCROLL ============
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ============ TABS (nosotros.html) ============
  document.querySelectorAll('[data-tabgroup]').forEach(group => {
    const name = group.getAttribute('data-tabgroup');
    const buttons = group.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll(`[data-panel-group="${name}"]`).forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
      });
    });
  });

  // ============ SERVICE FILTERS (servicios.html) ============
  const chips = document.querySelectorAll('.filter-chip');
  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-filter');
        document.querySelectorAll('.service-card').forEach(card => {
          const match = cat === 'todos' || card.getAttribute('data-cat') === cat;
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  // ============ SERVICE MODAL (servicios.html) ============
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    const modalTag = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalList = document.getElementById('modalList');
    const modalPrice = document.getElementById('modalPrice');
    const modalCta = document.getElementById('modalCta');

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.service-card');
        modalTag.textContent = card.getAttribute('data-cat-label');
        modalTitle.textContent = card.getAttribute('data-title');
        modalDesc.textContent = card.getAttribute('data-full');
        modalPrice.textContent = card.getAttribute('data-price');
        modalList.innerHTML = '';
        card.getAttribute('data-deliverables').split('|').forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<span>✓</span><span>${item}</span>`;
          modalList.appendChild(li);
        });
        modalCta.href = `contacto.html?servicio=${encodeURIComponent(card.getAttribute('data-title'))}`;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // ============ CONTACT FORM (contacto.html) ============
  const form = document.getElementById('contactForm');
  if (form) {
    // Prefill service from ?servicio= query param
    const params = new URLSearchParams(window.location.search);
    const servicioParam = params.get('servicio');
    const servicioSelect = document.getElementById('f-servicio');
    if (servicioParam && servicioSelect) {
      const opt = [...servicioSelect.options].find(o => o.value === servicioParam);
      if (opt) servicioSelect.value = servicioParam;
    }

    // Toggle marca / freelancer
    const toggleBtns = document.querySelectorAll('.user-toggle button');
    const marcaFields = document.querySelectorAll('.field-marca');
    const freelanceFields = document.querySelectorAll('.field-freelance');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const isMarca = btn.getAttribute('data-user') === 'marca';
        marcaFields.forEach(f => f.classList.toggle('field-hide', !isMarca));
        freelanceFields.forEach(f => f.classList.toggle('field-hide', isMarca));
        document.getElementById('f-tipo').value = isMarca ? 'Marca / emprendedor' : 'Freelancer creativo';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        const wrapper = field.closest('.field');
        if (wrapper && wrapper.classList.contains('field-hide')) return;
        const empty = !field.value || !field.value.trim();
        const badEmail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (empty || badEmail) {
          wrapper.classList.add('error');
          valid = false;
        } else if (wrapper) {
          wrapper.classList.remove('error');
        }
      });

      if (!valid) return;

      const nombre = document.getElementById('f-nombre').value.trim();
      const email = document.getElementById('f-email').value.trim();
      const tipo = document.getElementById('f-tipo').value;
      const servicio = servicioSelect ? servicioSelect.value : '';
      const mensaje = document.getElementById('f-mensaje').value.trim();

      const subject = encodeURIComponent(`Contacto desde mi tribu — ${tipo}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nCorreo: ${email}\nTipo: ${tipo}\nServicio de interés: ${servicio || 'No especificado'}\n\nMensaje:\n${mensaje}`
      );

      // Build functional mailto + WhatsApp links (real, working actions — no backend needed)
      const mailtoLink = `mailto:hola@mitribu.pe?subject=${subject}&body=${body}`;
      const waText = encodeURIComponent(`Hola mi tribu! Soy ${nombre} (${tipo}). ${mensaje}`);
      const waLink = `https://wa.me/51999999999?text=${waText}`;

      document.getElementById('sendEmailBtn').href = mailtoLink;
      document.getElementById('sendWaBtn').href = waLink;
      document.getElementById('successBox').classList.add('show');
      document.getElementById('successBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.querySelectorAll('input,select,textarea').forEach(f => f.disabled = true);
      document.getElementById('formSubmitBtn').disabled = true;
    });

    // live-clear error state
    form.querySelectorAll('input,select,textarea').forEach(f => {
      f.addEventListener('input', () => f.closest('.field') && f.closest('.field').classList.remove('error'));
    });
  }

  // ============ BUMPER AD (home) ============
  const bumper = document.getElementById('bumperAd');
  if (bumper) {
    if (localStorage.getItem('tribuBumperClosed') === '1') {
      bumper.style.display = 'none';
    }
    const bumperClose = document.getElementById('bumperClose');
    if (bumperClose) {
      bumperClose.addEventListener('click', () => {
        bumper.style.display = 'none';
        localStorage.setItem('tribuBumperClosed', '1');
      });
    }
  }

  // ============ CARRITO (localStorage) ============
  window.Cart = {
    KEY: 'tribuCart',
    get() {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
      catch (e) { return []; }
    },
    save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); this.updateBadge(); },
    add(item) {
      const items = this.get();
      items.push({ ...item, cartId: Date.now() + Math.random().toString(16).slice(2) });
      this.save(items);
      return items;
    },
    remove(cartId) {
      const items = this.get().filter(i => i.cartId !== cartId);
      this.save(items);
      return items;
    },
    total() { return this.get().reduce((sum, i) => sum + (Number(i.price) || 0), 0); },
    updateBadge() {
      const count = this.get().length;
      document.querySelectorAll('.cart-badge').forEach(b => {
        b.textContent = count;
        b.classList.toggle('zero', count === 0);
      });
    }
  };
  Cart.updateBadge();

  // ============ ADD TO CART buttons (perfil-freelancer.html, buscar-freelancer.html) ============
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        name: btn.getAttribute('data-name'),
        provider: btn.getAttribute('data-provider') || '',
        price: parseFloat(btn.getAttribute('data-price')) || 0,
        priceLabel: btn.getAttribute('data-price-label') || '',
        initials: btn.getAttribute('data-initials') || 'F'
      };
      Cart.add(item);
      const toast = document.getElementById('addedToast');
      if (toast) {
        toast.classList.add('show');
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
      }
    });
  });

  // ============ PACKAGE SELECTOR (perfil-freelancer.html) ============
  document.querySelectorAll('.pkg-card').forEach(card => {
    card.addEventListener('click', () => {
      card.parentElement.querySelectorAll('.pkg-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const addBtn = document.getElementById('addCartBtn');
      if (addBtn) {
        addBtn.setAttribute('data-name', card.getAttribute('data-pkg-name'));
        addBtn.setAttribute('data-price', card.getAttribute('data-pkg-price'));
        addBtn.setAttribute('data-price-label', card.getAttribute('data-pkg-price-label'));
      }
    });
  });

  // ============ FREELANCER SEARCH + FILTER (buscar-freelancer.html) ============
  const flSearch = document.getElementById('flSearchInput');
  const flChips = document.querySelectorAll('.freelancer-toolbar .filter-chip, .page-header .filter-chip[data-fl-filter]');
  const flCards = document.querySelectorAll('.freelancer-card');
  if (flCards.length) {
    const flCountEl = document.getElementById('flCount');
    let activeCat = 'todos';

    function applyFlFilter() {
      const term = (flSearch ? flSearch.value : '').trim().toLowerCase();
      let visible = 0;
      flCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        const haystack = card.getAttribute('data-search') || '';
        const matchesCat = activeCat === 'todos' || cat === activeCat;
        const matchesTerm = !term || haystack.toLowerCase().includes(term);
        const show = matchesCat && matchesTerm;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      if (flCountEl) flCountEl.textContent = `${visible} freelancer${visible === 1 ? '' : 's'} encontrado${visible === 1 ? '' : 's'}`;
    }

    document.querySelectorAll('[data-fl-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-fl-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCat = chip.getAttribute('data-fl-filter');
        applyFlFilter();
      });
    });
    if (flSearch) flSearch.addEventListener('input', applyFlFilter);

    // Prefill from ?q= param (coming from home hero search)
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    if (qParam && flSearch) flSearch.value = qParam;
    applyFlFilter();
  }

  // ============ HOME HERO SEARCH (index.html) ============
  const heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('heroSearchInput').value.trim();
      window.location.href = 'buscar-freelancer.html' + (val ? `?q=${encodeURIComponent(val)}` : '');
    });
  }

  // ============ RENDER CART (carrito.html) ============
  const cartList = document.getElementById('cartList');
  if (cartList) {
    function renderCart() {
      const items = Cart.get();
      const emptyBox = document.getElementById('cartEmpty');
      const summary = document.getElementById('cartSummary');
      if (!items.length) {
        cartList.innerHTML = '';
        if (emptyBox) emptyBox.style.display = 'block';
        if (summary) summary.style.display = 'none';
        return;
      }
      if (emptyBox) emptyBox.style.display = 'none';
      if (summary) summary.style.display = 'block';
      cartList.innerHTML = items.map(item => `
        <div class="cart-item">
          <div class="cart-item-avatar grad-circle">${(item.initials || 'F').slice(0,2).toUpperCase()}</div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>${item.provider ? 'Con ' + item.provider : 'Servicio creativo'}</p>
          </div>
          <div class="cart-item-price">${item.priceLabel || ('S/ ' + item.price)}</div>
          <button class="cart-item-remove" data-remove="${item.cartId}" aria-label="Quitar">✕</button>
        </div>
      `).join('');

      const subtotal = Cart.total();
      const subtotalEl = document.getElementById('cartSubtotal');
      const totalEl = document.getElementById('cartTotal');
      if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(0)}`;
      if (totalEl) totalEl.textContent = `S/ ${subtotal.toFixed(0)}`;

      cartList.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          Cart.remove(btn.getAttribute('data-remove'));
          renderCart();
        });
      });
    }
    renderCart();

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const items = Cart.get();
        if (!items.length) return;
        const list = items.map(i => `- ${i.name} (${i.priceLabel || 'S/ ' + i.price})`).join('\n');
        const waText = encodeURIComponent(`Hola mi tribu! Quiero contratar estos servicios:\n${list}\nTotal aprox: S/ ${Cart.total().toFixed(0)}`);
        window.open(`https://wa.me/51999999999?text=${waText}`, '_blank');
      });
    }
  }
});
