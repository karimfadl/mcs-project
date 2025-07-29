document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      const list = document.querySelector('.product-list');
      list.innerHTML = '';

      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="/${product.image_url}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>$${product.price}</p>
          <button>Add to Cart</button>
        `;
        list.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading products:', error);
      const list = document.querySelector('.product-list');
      list.innerHTML = '<p style="color:red;">Failed to load products. Please try again later.</p>';
    });
});
