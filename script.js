// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
  apiKey: "AIzaSyCc4mLj4Ahr03dpp6biamjqC3PlhbQAZCo",
  authDomain: "coffehouse-71463.firebaseapp.com",
  databaseURL: "https://coffehouse-71463-default-rtdb.firebaseio.com",
  projectId: "coffehouse-71463",
  storageBucket: "coffehouse-71463.appspot.com",
  messagingSenderId: "486533300629",
  appId: "1:486533300629:web:60848a8578d306b61eb69c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ========== CART FUNCTIONALITY ==========
let cart = [];

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  cartItems.innerHTML = '';
  let total = 0;
  
  cart.forEach(item => {
    if (item.quantity > 0) {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <span>${item.name} x${item.quantity}</span>
        <span>R${(item.price * item.quantity).toFixed(2)}</span>
      `;
      cartItems.appendChild(cartItem);
      total += item.price * item.quantity;
    }
  });
  
  cartTotal.textContent = `Total: R${total.toFixed(2)}`;
}

// Initialize menu items
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-item').forEach(item => {
    const id = item.querySelector('h3').textContent.toLowerCase().replace(' ', '-');
    const name = item.querySelector('h3').textContent;
    const price = parseFloat(item.querySelector('.price').textContent.replace('R', ''));
    
    cart.push({ id, name, price, quantity: 0 });
    
    // Set up quantity controls
    const minusBtn = item.querySelector('.minus');
    const plusBtn = item.querySelector('.plus');
    const quantityEl = item.querySelector('.quantity');
    
    minusBtn.addEventListener('click', () => {
      const itemInCart = cart.find(i => i.id === id);
      if (itemInCart.quantity > 0) {
        itemInCart.quantity--;
        quantityEl.textContent = itemInCart.quantity;
        updateCart();
      }
    });
    
    plusBtn.addEventListener('click', () => {
      const itemInCart = cart.find(i => i.id === id);
      itemInCart.quantity++;
      quantityEl.textContent = itemInCart.quantity;
      updateCart();
    });
  });

  // Checkout button
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (cart.some(item => item.quantity > 0)) {
      showCheckoutModal();
    } else {
      alert('Please add items to your cart first');
    }
  });
});

function showCheckoutModal() {
  // Implement your checkout logic here
  const orderItems = cart.filter(item => item.quantity > 0);
  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Save order to Firebase
  const ordersRef = db.ref("orders");
  ordersRef.push({
    items: orderItems,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
    userId: auth.currentUser?.uid || null
  }).then(() => {
    alert(`Order placed successfully! Total: R${total.toFixed(2)}`);
    // Clear cart
    cart.forEach(item => item.quantity = 0);
    document.querySelectorAll('.quantity').forEach(el => el.textContent = '0');
    updateCart();
  }).catch(error => {
    alert("Order failed: " + error.message);
  });
}

// ========== MOBILE NAV TOGGLE ==========
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========== CONTACT FORM ==========
const contactForm = document.getElementById('contact-form');
const formResponse = document.getElementById('form-response');

if (contactForm && formResponse) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const message = this.message.value.trim();

    if (!name || !email || !message) {
      formResponse.textContent = "Please fill in all fields.";
      formResponse.style.color = 'red';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formResponse.textContent = "Please enter a valid email address.";
      formResponse.style.color = 'red';
      return;
    }

    // Save message to Firebase
    const contactRef = db.ref("contacts");
    contactRef.push({
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    });

    formResponse.style.color = 'green';
    formResponse.textContent = `Thank you, ${name}! Your message has been sent.`;
    this.reset();
  });
}

// ========== RESERVATION FORM ==========
const reservationForm = document.getElementById("reservation-form");
const reservationSuccess = document.getElementById("reservation-success");
const reservationAmountInput = document.getElementById("reservation-amount");
const reservationGuestsInput = reservationForm?.querySelector('input[type="number"][min="1"]');

if (reservationForm && reservationSuccess && reservationAmountInput && reservationGuestsInput) {
  // Update amount based on number of guests
  reservationGuestsInput.addEventListener('input', () => {
    const guests = parseInt(reservationGuestsInput.value) || 1;
    reservationAmountInput.value = guests * 50;
  });

  reservationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = reservationForm.querySelector('input[placeholder="Full Name"]').value.trim();
    const email = reservationForm.querySelector('input[type="email"]').value.trim();
    const phone = reservationForm.querySelector('input[type="tel"]').value.trim();
    const guests = reservationGuestsInput.value;
    const date = reservationForm.querySelector('input[type="date"]').value;
    const time = reservationForm.querySelector('input[type="time"]').value;
    const requests = reservationForm.querySelector('textarea').value;
    const amount = Number(reservationAmountInput.value);

    if (!amount || amount < 50) {
      alert("Invalid payment amount.");
      return;
    }

    // Save to Firebase
    const reservationRef = db.ref("reservations");
    reservationRef.push({
      name,
      email,
      phone,
      guests,
      date,
      time,
      requests,
      amount,
      createdAt: new Date().toISOString()
    });

    reservationSuccess.style.display = "block";
    reservationForm.reset();
    reservationAmountInput.value = 50;

    setTimeout(() => {
      reservationSuccess.style.display = "none";
    }, 4000);
  });
}

// ========== PICKUP ORDER FORM ==========
const pickupForm = document.getElementById("pickup-form");
const pickupSuccess = document.getElementById("pickup-success");
const pickupAmountInput = document.getElementById("pickup-amount");

if (pickupForm && pickupSuccess && pickupAmountInput) {
  pickupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = pickupForm.querySelector('input[placeholder="Full Name"]').value.trim();
    const phone = pickupForm.querySelector('input[placeholder="Phone Number"]').value.trim();
    const order = pickupForm.querySelector('input[placeholder^="Order"]').value.trim();
    const time = pickupForm.querySelector('input[type="time"]').value;
    const amount = Number(pickupAmountInput.value);

    if (!amount || amount < 1) {
      alert("Please enter a valid payment amount.");
      return;
    }

    // Save to Firebase
    const pickupRef = db.ref("pickup_orders");
    pickupRef.push({
      name,
      phone,
      order,
      time,
      amount,
      createdAt: new Date().toISOString()
    });

    pickupSuccess.style.display = "block";
    pickupForm.reset();

    setTimeout(() => {
      pickupSuccess.style.display = "none";
    }, 4000);
  });
}