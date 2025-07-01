import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc4mLj4Ahr03dpp6biamjqC3PlhbQAZCo",
  authDomain: "coffehouse-71463.firebaseapp.com",
  projectId: "coffehouse-71463",
  storageBucket: "coffehouse-71463.firebasestorage.app",
  messagingSenderId: "486533300629",
  appId: "1:486533300629:web:60848a8578d306b61eb69c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check auth state
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      // Load initial tab content
      loadOrders();
      
      // Set up tab switching
      setupTabs();
    }
  });

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
});

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab styling
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
      
      // Load appropriate content
      switch(btn.dataset.tab) {
        case 'orders':
          loadOrders();
          break;
        case 'reservations':
          loadReservations();
          break;
        case 'analytics':
          loadAnalytics();
          break;
      }
    });
  });
}

async function loadOrders() {
  const ordersDisplay = document.getElementById('orders-display');
  ordersDisplay.innerHTML = '<p>Loading orders...</p>';
  
  try {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("createdAt", "desc"));
    const ordersSnapshot = await getDocs(q);
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (orders.length) {
      let html = `
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleString();
        html += `
          <tr>
            <td>${order.id.substring(0, 8)}</td>
            <td>${order.userName || 'Guest'}</td>
            <td>
              <ul class="order-items">
                ${order.items.map(item => `
                  <li>${item.name} x${item.quantity}</li>
                `).join('')}
              </ul>
            </td>
            <td>R${order.total.toFixed(2)}</td>
            <td>${date}</td>
            <td class="status-${order.status}">${order.status}</td>
            <td>
              <select class="status-select" data-order-id="${order.id}">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `;
      });
      
      html += `</tbody></table>`;
      ordersDisplay.innerHTML = html;
      
      // Add status change handlers
      document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async () => {
          try {
            const orderRef = doc(db, "orders", select.dataset.orderId);
            await updateDoc(orderRef, { status: select.value });
            // Refresh the display
            loadOrders();
          } catch (error) {
            alert("Failed to update order: " + error.message);
          }
        });
      });
    } else {
      ordersDisplay.innerHTML = "<p>No orders found.</p>";
    }
  } catch (error) {
    ordersDisplay.innerHTML = `<p style="color:red;">Error loading orders: ${error.message}</p>`;
  }
}

async function loadReservations() {
  const reservationsDisplay = document.getElementById('reservations-display');
  reservationsDisplay.innerHTML = '<p>Loading reservations...</p>';
  
  try {
    const reservationsCol = collection(db, "reservations");
    const q = query(reservationsCol, orderBy("date"), orderBy("time"));
    const reservationsSnapshot = await getDocs(q);
    const reservations = reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (reservations.length) {
      let html = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      reservations.forEach(res => {
        html += `
          <tr>
            <td>${escapeHTML(res.name)}</td>
            <td>${escapeHTML(res.date)}</td>
            <td>${escapeHTML(res.time)}</td>
            <td>${escapeHTML(res.guests)}</td>
            <td>${escapeHTML(res.phone)}<br>${escapeHTML(res.email)}</td>
            <td class="status-${res.status || 'pending'}">${escapeHTML(res.status || 'pending')}</td>
            <td>
              <select class="reservation-status" data-reservation-id="${res.id}">
                <option value="pending" ${res.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${res.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="seated" ${res.status === 'seated' ? 'selected' : ''}>Seated</option>
                <option value="cancelled" ${res.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                <option value="no-show" ${res.status === 'no-show' ? 'selected' : ''}>No Show</option>
              </select>
              <button class="reschedule-btn" data-reservation-id="${res.id}">Reschedule</button>
            </td>
          </tr>
        `;
      });
      
      html += `</tbody></table>`;
      reservationsDisplay.innerHTML = html;
      
      // Add status change handlers
      document.querySelectorAll('.reservation-status').forEach(select => {
        select.addEventListener('change', async () => {
          try {
            const resRef = doc(db, "reservations", select.dataset.reservationId);
            await updateDoc(resRef, { status: select.value });
          } catch (error) {
            alert("Failed to update reservation: " + error.message);
          }
        });
      });
      
      // Add reschedule handlers
      document.querySelectorAll('.reschedule-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const resId = btn.dataset.reservationId;
          const newDate = prompt("Enter new date (YYYY-MM-DD):");
          const newTime = prompt("Enter new time (HH:MM):");
          
          if (newDate && newTime) {
            try {
              const resRef = doc(db, "reservations", resId);
              await updateDoc(resRef, { 
                date: newDate,
                time: newTime,
                status: 'rescheduled'
              });
              loadReservations();
            } catch (error) {
              alert("Failed to reschedule: " + error.message);
            }
          }
        });
      });
    } else {
      reservationsDisplay.innerHTML = "<p>No reservations found.</p>";
    }
  } catch (error) {
    reservationsDisplay.innerHTML = `<p style="color:red;">Error loading reservations: ${error.message}</p>`;
  }
}

async function loadAnalytics() {
  const analyticsDisplay = document.getElementById('analytics-display');
  analyticsDisplay.innerHTML = '<p>Loading analytics...</p>';
  
  try {
    // Get recent orders for revenue calculation
    const ordersCol = collection(db, "orders");
    const ordersQuery = query(ordersCol, orderBy("createdAt", "desc"), limit(50));
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    // Get reservations
    const reservationsCol = collection(db, "reservations");
    const reservationsSnapshot = await getDocs(reservationsCol);
    const reservations = reservationsSnapshot.docs.map(doc => doc.data());
    
    // Calculate metrics
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = orders
      .filter(order => order.createdAt.includes(today))
      .reduce((sum, order) => sum + order.total, 0);
    
    const currentMonth = new Date().getMonth() + 1;
    const monthlyRevenue = orders
      .filter(order => {
        const orderMonth = new Date(order.createdAt).getMonth() + 1;
        return orderMonth === currentMonth;
      })
      .reduce((sum, order) => sum + order.total, 0);
    
    const totalCustomers = await getDocs(collection(db, "customers")).then(snap => snap.size);
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
    
    // Display metrics
    analyticsDisplay.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Today's Revenue</h3>
          <p>R${todayRevenue.toFixed(2)}</p>
        </div>
        <div class="metric-card">
          <h3>This Month</h3>
          <p>R${monthlyRevenue.toFixed(2)}</p>
        </div>
        <div class="metric-card">
          <h3>Total Customers</h3>
          <p>${totalCustomers}</p>
        </div>
        <div class="metric-card">
          <h3>Upcoming Reservations</h3>
          <p>${confirmedReservations}</p>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="revenue-chart"></canvas>
      </div>
      <div class="chart-container">
        <canvas id="popular-items-chart"></canvas>
      </div>
    `;
    
    // Prepare data for charts
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    
    const dailyRevenue = last7Days.map(day => {
      return orders
        .filter(order => order.createdAt.includes(day))
        .reduce((sum, order) => sum + order.total, 0);
    });
    
    // Get popular items
    const allItems = orders.flatMap(order => order.items);
    const itemCounts = {};
    allItems.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
    new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: last7Days.map(day => new Date(day).toLocaleDateString()),
        datasets: [{
          label: 'Daily Revenue (ZAR)',
          data: dailyRevenue,
          backgroundColor: '#f3961c',
          borderColor: '#d1790f',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Popular Items Chart
    const itemsCtx = document.getElementById('popular-items-chart').getContext('2d');
    new Chart(itemsCtx, {
      type: 'pie',
      data: {
        labels: popularItems.map(item => item[0]),
        datasets: [{
          label: 'Popular Items',
          data: popularItems.map(item => item[1]),
          backgroundColor: [
            '#3b141c',
            '#f3961c',
            '#8c5e58',
            '#d1790f',
            '#faf4f5'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
    
  } catch (error) {
    analyticsDisplay.innerHTML = `<p style="color:red;">Error loading analytics: ${error.message}</p>`;
  }
}

// Helper function to escape HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}