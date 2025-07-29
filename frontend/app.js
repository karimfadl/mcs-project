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
        ${
          prod.stock_quantity > 0
            ? `<button class="add-to-cart-btn" data-id="${prod.product_id}">Add to Cart</button>`
            : `<button class="add-to-cart-btn" disabled style="background:#ccc;cursor:not-allowed;">Out of Stock</button>`
        }
        <button class="read-more-btn" data-id="${prod.product_id}">Read More</button>
        <div class="product-desc" id="desc-${prod.product_id}" style="display:none;">
          <p>${prod.description}</p>
          <button onclick="document.getElementById('desc-${prod.product_id}').style.display='none'">Close</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners for add-to-cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', function() {
          addToCart(this.getAttribute('data-id'), products);
        });
      }
    });

    // Attach event listeners for read-more
    document.querySelectorAll('.read-more-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        document.getElementById(`desc-${id}`).style.display = 'block';
      });
    });

  } catch (err) {
    productList.innerHTML = '<p>Error loading products.</p>';
  }
});

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