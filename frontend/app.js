(function setupReviewModal() {
  if (document.getElementById('reviewModal')) return;
  const modal = document.createElement('div');
  modal.id = 'reviewModal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.28)';
  modal.style.zIndex = 9999;
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.innerHTML = `
    <div id="reviewContent" style="background:#fff;margin:5vh auto;max-width:410px;padding:2rem 1.2rem;border-radius:12px;box-shadow:0 0 24px #2225;">
      <h3 style="margin-top:0">Product Reviews</h3>
      <div id="reviewsHere"></div>
      <button id="closeReviewModal" style="margin-top:1.2em">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeReviewModal').onclick = function() {
    document.getElementById('reviewModal').style.display = 'none';
  };
})();

document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('productList');
  if (!productList) return;

  try {
    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();

    if (!products.length) {
      productList.innerHTML = '<p>No products available.</p>';
      return;
    }

    productList.innerHTML = products.map(prod => `
      <div class="product-card">
        <img src="${prod.image_url}" alt="${prod.name}" />
        <h3>${prod.name}</h3>
        <p>${prod.price} USD</p>
        ${prod.stock_quantity > 0
            ? `<button class="add-to-cart-btn" data-id="${prod.product_id}">Add to Cart</button>`
            : `<button class="add-to-cart-btn" disabled style="background:#ccc;cursor:not-allowed;">Out of Stock</button>`
        }
        <button class="read-more-btn" data-id="${prod.product_id}">Read More</button>
        <button class="show-reviews-btn" data-id="${prod.product_id}">Show Reviews</button>
        <div class="product-description" id="desc-${prod.product_id}" style="display:none;">
          <p>${prod.description}</p>
          <button onclick="document.getElementById('desc-${prod.product_id}').style.display='none'">Close</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', function() {
          addToCart(this.getAttribute('data-id'), products);
        });
      }
    });

    document.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        document.getElementById(`desc-${id}`).style.display = 'block';
      });
    });

    document.querySelectorAll('.show-reviews-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        await showReviewsModal(id);
      });
    });

  } catch (err) {
    productList.innerHTML = '<p style="color:red;">Error loading products.</p>';
  }
});

async function showReviewsModal(productId) {
  const reviewsHere = document.getElementById('reviewsHere');
  reviewsHere.innerHTML = 'Loading reviews...';
  document.getElementById('reviewModal').style.display = 'flex';
  try {
    const res = await fetch(`http://localhost:3000/reviews/${productId}`);
    const reviews = await res.json();
    if (!reviews.length) {
      reviewsHere.innerHTML = '<em>No reviews yet.</em>';
      return;
    }
    reviewsHere.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div style="font-size:1.18em;color:#f9a825;font-weight:bold;line-height:1;">
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
        </div>
        <div style="font-size:1em;color:#444;padding:0.1em 0 0.2em 0">
          ${r.comment || ''}
        </div>
        <div style="font-size:0.95em;color:#555;">
          By <b>${r.username}</b> on <span style="color:#888;">${r.created_at ? r.created_at.split('T')[0] : ''}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    reviewsHere.innerHTML = '<span style="color:red;">Could not load reviews.</span>';
  }
}

function addToCart(productId, products) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const product = products.find(p => p.product_id == productId);
  if (!product) return;

  const existing = cart.find(item => item.product_id == productId);
  if (existing) {
    if (existing.quantity < product.stock_quantity) {
      existing.quantity += 1;
    } else {
      alert('No more in stock!');
      return;
    }
  } else {
    if (product.stock_quantity > 0) {
      cart.push({ ...product, quantity: 1 });
    } else {
      alert('Out of stock!');
      return;
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
}