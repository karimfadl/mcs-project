document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      const list = document.querySelector('.product-list');
      list.innerHTML = '';

      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const desc = product.description && product.description.trim() !== '' 
          ? product.description 
          : 'No description available for this product.';

        card.innerHTML = `
          <img src="/${product.image_url}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>$${product.price}</p>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="add-to-cart-btn">Add to Cart</button>
            <button class="read-more-btn">Read More</button>
          </div>
          <div class="product-description" style="display:none;">
            <strong>Description:</strong> <span>${desc}</span>
          </div>
        `;

        // Read More button functionality
        const readMoreBtn = card.querySelector('.read-more-btn');
        const descDiv = card.querySelector('.product-description');
        readMoreBtn.addEventListener('click', () => {
          if (descDiv.style.display === 'none') {
            descDiv.style.display = 'block';
            readMoreBtn.textContent = 'Show Less';
          } else {
            descDiv.style.display = 'none';
            readMoreBtn.textContent = 'Read More';
          }
        });

        // Add to Cart button (placeholder functionality for now)
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
          alert('This will add the product to the cart! (Feature coming soon)');
        });

        list.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading products:', error);
      const list = document.querySelector('.product-list');
      list.innerHTML = '<p style="color:red;">Failed to load products. Please try again later.</p>';
    });
});