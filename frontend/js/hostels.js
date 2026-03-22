document.addEventListener('DOMContentLoaded', () => {
    // Handle URL location search
    const initialLocation = getQueryParam('location');
    if (initialLocation) {
        document.getElementById('locationFilter').value = getClosestLocation(initialLocation);
    }

    document.getElementById('applyFiltersBtn').addEventListener('click', () => {
        fetchHostels();
    });

    // Initial load
    fetchHostels();
});

function getClosestLocation(typed) {
    const term = typed.toLowerCase();
    const valid = ['Medchal', 'Kandlakoya', 'Kompally'];
    return valid.find(v => v.toLowerCase().includes(term)) || '';
}

async function fetchHostels() {
    const grid = document.getElementById('hostelsGrid');
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 6rem; color: var(--text-light);"><p>Searching for best stays...</p></div>';

    try {
        const loc = document.getElementById('locationFilter').value;
        const type = document.getElementById('typeFilter').value;
        const priceRange = document.getElementById('priceFilter').value;
        const roomType = document.getElementById('roomTypeFilter').value;

        const params = new URLSearchParams();
        if (loc) params.append('location', loc);
        if (type) params.append('type', type);
        
        // We'll filter price and roomType on frontend or update backend
        // For a student project, client-side filtering after fetch is fine if data is small,
        // or we pass them to API. Let's pass to API to keep it clean.
        if (priceRange) params.append('price', priceRange);
        if (roomType) params.append('sharing', roomType);

        const res = await fetch(`${API_URL}/hostels?${params.toString()}`);
        const hostels = await res.json();
        renderHostels(hostels);
    } catch (e) {
        grid.innerHTML = '<p class="text-center" style="grid-column:1/-1; padding:4rem; color:var(--danger);">Unable to load hostels.</p>';
    }
}

function renderHostels(hostels) {
    const grid = document.getElementById('hostelsGrid');
    grid.innerHTML = '';

    if (!hostels || hostels.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 6rem; color: var(--text-light);"><i data-lucide="frown" style="width:48px; height:48px; margin-bottom:1rem;"></i><p>No hostels match your filters.</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    hostels.forEach(h => {
        const rating = h.avg_rating > 0 ? Number(h.avg_rating).toFixed(1) : 'New';
        const img = getHostelImage(h.image_url);
        
        grid.innerHTML += `
            <div class="hostel-card card">
                <div class="img-wrapper">
                    <img src="${img}" alt="${h.name}">
                    <span class="badge ${h.type === 'Girls' ? 'badge-primary' : 'badge-success'} type-badge">${h.type} Only</span>
                </div>
                <div class="hostel-content">
                    <h3 class="hostel-name">${h.name}</h3>
                    <div class="hostel-meta">
                        <span><i data-lucide="map-pin" style="width:14px"></i> ${h.location}</span>
                        <span style="color:#fbbf24; display:flex; align-items:center;">
                            ${h.avg_rating > 0 ? Array(Math.round(h.avg_rating)).fill('<i data-lucide="star" style="width:12px; fill:currentColor"></i>').join('') : '<i data-lucide="star" style="width:12px"></i>'} 
                            <span style="color:var(--text-light); margin-left:4px">${rating}</span>
                        </span>
                    </div>
                    
                    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
                        ${renderAmenityBadges(h.amenities)}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="price-tag" style="margin-bottom:0;">
                            ₹${h.starting_price || '5,500'}<span class="price-sub">/mo</span>
                        </div>
                        <a href="hostel-details.html?id=${h.id}" class="btn btn-primary" style="padding:0.5rem 1rem; font-size:0.85rem;">Details</a>
                    </div>
                </div>
            </div>
        `;
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderAmenityBadges(amenitiesString) {
    let ams = [];
    try {
        ams = typeof amenitiesString === 'string' ? JSON.parse(amenitiesString) : (amenitiesString || []);
    } catch(e) { ams = []; }
    if (ams.length === 0) ams = ['WiFi', 'Food', 'CCTV'];
    
    return ams.slice(0, 3).map(a => `
        <span style="font-size:0.65rem; padding:2px 8px; background:var(--bg-main); border-radius:4px; color:var(--text-light); border:1px solid var(--border);">${a}</span>
    `).join('');
}
