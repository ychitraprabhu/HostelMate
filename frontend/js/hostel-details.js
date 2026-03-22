let currentHostel = null;
let roomTypes = [];
let selectedRoomTypeId = null;
let selectedRoomPrice = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const id = getQueryParam('id');
    if (!id) {
        window.location.href = 'hostels.html';
        return;
    }

    await loadHostelDetails(id);
    
    // Setup PayPal Button if student
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'student') {
        if (document.getElementById('paypal-button-container')) setupPaypalButton();
        if (document.getElementById('simulateBtn')) {
            document.getElementById('simulateBtn').addEventListener('click', simulatePayment);
        }
    }
});

async function simulatePayment() {
    if (!confirm('This will bypass PayPal and mark the booking as PAID for development purposes. Continue?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) { alert('Please login.'); return; }

    try {
        // 1. Create Booking
        const bRes = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                hostel_id: currentHostel.id,
                room_type_id: selectedRoomTypeId,
                start_date: new Date().toISOString().split('T')[0]
            })
        });
        const bData = await bRes.json();
        if (!bRes.ok) throw new Error(bData.error || 'Booking failed');

        // 2. Simulate Success (Mark active and insert payment record)
        // We'll use a hidden "capture-order" logic or just update DB directly if we had a "test" endpoint.
        // For simplicity, we'll hit the capture-order with a "simulated_id"
        const cRes = await fetch(`${API_URL}/bookings/payments/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ paypal_order_id: 'SIMULATED_'+Date.now(), booking_id: bData.booking_id })
        });
        
        if (cRes.ok) {
            alert('Simulation Successful! Your stay is confirmed.');
            window.location.href = 'student-dashboard.html';
        } else {
            const cData = await cRes.ok ? {} : await cRes.json();
            alert('Simulation failed: ' + (cData.error || 'Server error'));
        }
    } catch(e) {
        alert(e.message);
    }
}

async function loadHostelDetails(id) {
    try {
        const response = await fetch(`${API_URL}/hostels/${id}`);
        if (!response.ok) throw new Error('Hostel not found');
        
        const data = await response.json();
        currentHostel = data.hostel;
        roomTypes = data.roomTypes || [];
        
        document.getElementById('hostelName').textContent = currentHostel.name;
        document.getElementById('hostelLoc').textContent = currentHostel.location;
        document.getElementById('hostelDesc').textContent = currentHostel.description;
        document.getElementById('hostelImg').src = getHostelImage(currentHostel.image_url);
        
        document.getElementById('ownerName').textContent = "Owner: " + (currentHostel.owner_name || "Verified Provider");
        document.getElementById('chatBtn').href = `chat.html?hostel_id=${id}&owner_id=${currentHostel.owner_id}`;

        renderAmenities(currentHostel.amenities);
        renderRoomTypes(roomTypes);
        renderReviews(data.reviews || [], data.reviewCount || 0);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('hostelContent').style.display = 'block';

        if (typeof lucide !== 'undefined') lucide.createIcons();
        checkReviewEligibility(id);
    } catch (err) {
        console.error(err);
        document.getElementById('loading').innerHTML = '<p style="color:var(--danger)">Hostel not found.</p>';
    }
}

async function checkReviewEligibility(hostelId) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'student') return;

    try {
        const res = await fetch(`${API_URL}/bookings/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Check if there's any 'confirmed' booking for this hostel
        const hasStayed = data.bookings.some(b => b.hostel_id == hostelId && b.status === 'confirmed');
        if (hasStayed) {
            document.getElementById('reviewStatusContainer').style.display = 'block';
        }
    } catch (e) { console.error('Eligibility check failed', e); }
}

// Review Modal Logic
let selectedRating = 0;

function openReviewModal() {
    document.getElementById('reviewModal').style.display = 'flex';
    setupStarRating();
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            selectedRating = parseInt(s.getAttribute('data-value'));
            updateStars();
        });
        s.addEventListener('mouseover', () => {
            const val = parseInt(s.getAttribute('data-value'));
            highlightStars(val);
        });
    });
    document.getElementById('ratingStars').addEventListener('mouseleave', updateStars);
}

function highlightStars(val) {
    document.querySelectorAll('.star-rating').forEach(s => {
        const v = parseInt(s.getAttribute('data-value'));
        s.style.color = v <= val ? '#fbbf24' : 'var(--border)';
        s.style.fill = v <= val ? '#fbbf24' : 'none';
    });
}

function updateStars() {
    document.querySelectorAll('.star-rating').forEach(s => {
        const v = parseInt(s.getAttribute('data-value'));
        s.style.color = v <= selectedRating ? '#fbbf24' : 'var(--border)';
        s.style.fill = v <= selectedRating ? '#fbbf24' : 'none';
    });
    document.getElementById('ratingInput').value = selectedRating || '';
}

async function submitReview(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const comment = document.getElementById('reviewComment').value;
    const isAnonymous = document.getElementById('isAnonymous').checked;

    if (!selectedRating) {
        alert('Please select a star rating.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                hostel_id: currentHostel.id,
                rating: selectedRating,
                comment,
                is_anonymous: isAnonymous
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Review submitted! Thank you.');
            location.reload();
        } else {
            alert(data.error || 'Submission failed');
        }
    } catch (e) {
        alert('Error submitting review');
    }
}

function renderReviews(reviews, count) {
    const list = document.getElementById('reviewsList');
    document.getElementById('reviewCountHeader').textContent = `${count} review${count !== 1 ? 's' : ''}`;
    
    if (reviews.length === 0) {
        list.innerHTML = '<p style="color:var(--text-light); text-align:center; padding:2rem;">No reviews yet. Be the first to stay!</p>';
        return;
    }

    list.innerHTML = reviews.map(r => `
        <div class="card" style="padding:1.5rem; transition:none; border-color:var(--bg-main);">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
                <span style="font-weight:600; color:var(--text-dark);">${r.is_anonymous ? 'Anonymous Student' : r.user_name}</span>
                <div style="color:#fbbf24; display:flex; gap:2px;">
                    ${Array(r.rating).fill('<i data-lucide="star" style="width:14px; fill:currentColor"></i>').join('')}
                </div>
            </div>
            <p style="color:var(--text-main); font-size:0.95rem;">"${r.comment}"</p>
            <div style="margin-top:1rem; font-size:0.75rem; color:var(--text-light);">
                ${new Date(r.created_at).toLocaleDateString()} ${r.is_verified ? '• <span style="color:var(--success)">Verified Stay</span>' : ''}
            </div>
        </div>
    `).join('');
}

function renderAmenities(amenitiesString) {
// ... existing renderAmenities and other functions ...
    const grid = document.getElementById('amenitiesGrid');
    grid.innerHTML = '';
    
    let amenities = [];
    try {
        amenities = typeof amenitiesString === 'string' ? JSON.parse(amenitiesString) : (amenitiesString || []);
    } catch(e) { amenities = []; }

    if (amenities.length === 0) amenities = ['WiFi', 'CCTV', 'Security', '24/7 Water'];

    amenities.forEach(am => {
        grid.innerHTML += `
            <div class="amenity-item">
                <i data-lucide="${getAmenityIcon(am)}" style="width:18px; color:var(--primary);"></i>
                <span>${am}</span>
            </div>
        `;
    });
}

function getAmenityIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('wifi')) return 'wifi';
    if (n.includes('food')) return 'utensils';
    if (n.includes('cctv') || n.includes('security')) return 'shield-check';
    if (n.includes('water')) return 'droplets';
    if (n.includes('power') || n.includes('generator')) return 'zap';
    if (n.includes('parking')) return 'car';
    if (n.includes('laundry')) return 'shirt';
    return 'check-circle';
}

function renderRoomTypes(types) {
    const list = document.getElementById('roomTypesList');
    list.innerHTML = '';

    if (!types || types.length === 0) {
        list.innerHTML = '<p style="color:var(--text-light)">No rooms available.</p>';
        return;
    }

    types.forEach((rt, index) => {
        const btn = document.createElement('button');
        btn.className = `room-type-btn ${index === 0 ? 'active' : ''}`;
        btn.onclick = () => selectRoom(rt.id, rt.price_per_month, btn);
        btn.innerHTML = `
            <span class="room-name">${rt.type_name}</span>
            <span class="room-price">₹${rt.price_per_month.toLocaleString()}</span>
        `;
        list.appendChild(btn);
        
        if (index === 0) selectRoom(rt.id, rt.price_per_month, btn);
    });
}

function selectRoom(id, price, element) {
    selectedRoomTypeId = id;
    selectedRoomPrice = price;
    document.getElementById('displayPrice').textContent = `₹${price.toLocaleString()}`;
    
    document.querySelectorAll('.room-type-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

// PayPal Integration on Frontend
async function setupPaypalButton() {
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        return;
    }

    paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect' },
        createOrder: async (data, actions) => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to book.');
                window.location.href = 'login.html';
                return;
            }

            // 1. Create Booking First
            const bookingRes = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    hostel_id: currentHostel.id,
                    room_type_id: selectedRoomTypeId,
                    start_date: new Date().toISOString().split('T')[0]
                })
            });
            const bookingData = await bookingRes.json();
            if (!bookingRes.ok) {
                alert(bookingData.error || 'Booking failed');
                throw new Error('Booking failed');
            }

            const booking_id = bookingData.booking_id;
            localStorage.setItem('pending_booking_id', booking_id);

            // 2. Create PayPal Order on Backend
            const orderRes = await fetch(`${API_URL}/bookings/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ booking_id, amount_inr: selectedRoomPrice })
            });
            const orderData = await orderRes.json();
            return orderData.paypal_order_id;
        },
        onApprove: async (data, actions) => {
            const token = localStorage.getItem('token');
            const booking_id = localStorage.getItem('pending_booking_id');
            
            const captureRes = await fetch(`${API_URL}/bookings/payments/capture-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ paypal_order_id: data.orderID, booking_id })
            });
            
            const captureData = await captureRes.json();
            if (captureRes.ok) {
                alert('Payment Confirmed! Redirecting to dashboard...');
                localStorage.removeItem('pending_booking_id');
                window.location.href = 'student-dashboard.html';
            } else {
                alert('Payment capture failed: ' + captureData.error);
            }
        },
        onError: (err) => {
            console.error('PayPal Error:', err);
            alert('Something went wrong with the payment.');
        }
    }).render('#paypal-button-container');
}
