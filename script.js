// Helper: format currency
const formatCurrency = n => `$${n.toLocaleString('es-CO')}`;

// ELEMENTS
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartPanel = document.getElementById('cart-panel') || document.querySelector('.cart-panel');
const cartItemsList = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const closeCartBtn = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const toast = document.getElementById('toast');

let cart = {}; // { id: {id,name,price,qty,img} }
let total = 0;

// Try load from localStorage
try {
  const saved = JSON.parse(localStorage.getItem('boor_cart'));
  if (saved) cart = saved;
} catch(e){ cart = {} }
updateCartUI();

// Toggle panel
cartBtn.addEventListener('click', () => {
  const isHidden = cartPanel.getAttribute('aria-hidden') === 'true' || !cartPanel.hasAttribute('aria-hidden');
  cartPanel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
});

// Close btn
if (closeCartBtn) closeCartBtn.addEventListener('click', () => cartPanel.setAttribute('aria-hidden', 'true'));

// Click outside to close
document.addEventListener('click', (e) => {
  if (!cartPanel) return;
  const withinCart = cartPanel.contains(e.target) || cartBtn.contains(e.target);
  if (!withinCart) cartPanel.setAttribute('aria-hidden', 'true');
});

// Add to cart buttons + "vuelo" animation
document.querySelectorAll('.btn-add').forEach(button => {
  button.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price, 10);
    const imgEl = card.querySelector('img');

    // Flight animation: clone image and fly to cart icon
    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    const clone = imgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = imgRect.left + 'px';
    clone.style.top = imgRect.top + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.borderRadius = '12px';
    clone.style.zIndex = 9999;
    clone.style.transition = 'all 700ms cubic-bezier(.2,.9,.2,1)';
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = (cartRect.left + cartRect.width/2 - imgRect.width*0.15) + 'px';
      clone.style.top = (cartRect.top + cartRect.height/2 - imgRect.height*0.15) + 'px';
      clone.style.width = (imgRect.width * 0.3) + 'px';
      clone.style.height = (imgRect.height * 0.3) + 'px';
      clone.style.opacity = '0.6';
      clone.style.transform = 'rotate(10deg) scale(.8)';
    });

    // Remove clone after animation
    setTimeout(() => clone.remove(), 800);

    // Add to cart data after short delay (so animation syncs)
    setTimeout(() => {
      addToCart({ id, name, price, img: imgEl.src });
      showToast(`${name} añadido`);
    }, 150);
  });
});

// Add function
function addToCart(item) {
  if (cart[item.id]) {
    cart[item.id].qty += 1;
  } else {
    cart[item.id] = { ...item, qty: 1 };
  }
  persistCart();
  updateCartUI();
}

// Persist
function persistCart(){
  try {
    localStorage.setItem('boor_cart', JSON.stringify(cart));
  } catch(e){}
}

// Update UI
function updateCartUI(){
  // count
  const qty = Object.values(cart).reduce((s,i)=> s + i.qty, 0);
  cartCount.textContent = qty;
  // list
  cartItemsList.innerHTML = '';
  total = 0;
  Object.values(cart).forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement('li');

    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="item-info">
        <h4>${item.name}</h4>
        <div class="meta">${formatCurrency(item.price)} • ${item.qty} unidad(es)</div>
      </div>
      <div class="item-actions">
        <div class="qty-control">
          <button class="dec" data-id="${item.id}">-</button>
          <div class="qty">${item.qty}</div>
          <button class="inc" data-id="${item.id}">+</button>
        </div>
        <button class="remove-btn" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  cartTotalEl.textContent = formatCurrency(total);

  // bind item buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      delete cart[id];
      persistCart();
      updateCartUI();
    });
  });
  document.querySelectorAll('.inc').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      cart[id].qty += 1;
      persistCart();
      updateCartUI();
    });
  });
  document.querySelectorAll('.dec').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      if (cart[id].qty > 1) cart[id].qty -= 1;
      else delete cart[id];
      persistCart();
      updateCartUI();
    });
  });
}

// Clear cart
clearCartBtn.addEventListener('click', () => {
  cart = {};
  persistCart();
  updateCartUI();
});

// Checkout (simulado)
checkoutBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  // Simulación de pago
  alert(`Total a pagar: ${formatCurrency(total)}\n\n(Checkout simulado)`);
  cart = {};
  persistCart();
  updateCartUI();
});

// Contact form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Mensaje enviado. ¡Gracias!');
    contactForm.reset();
  });
}

// Toast
let toastTimer;
function showToast(txt) {
  toast.textContent = txt;
  toast.style.opacity = 1;
  toast.style.transform = 'translateY(0)';
  toast.style.pointerEvents = 'auto';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.pointerEvents = 'none';
  }, 1400);
}