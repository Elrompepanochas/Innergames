document.addEventListener('DOMContentLoaded', () => {

    let cart = [];

    function updateCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        let total = 0;
        cartItems.innerHTML = '';

        cart.forEach(item => {
            total += item.price;

            const li = document.createElement('li');
            li.textContent = `${item.name} - ₡${item.price.toLocaleString()}`;
            cartItems.appendChild(li);
        });

        cartTotal.textContent = `Total: ₡${total.toLocaleString()}`;
    }

    // BOTONES DOWNLOAD
    document.querySelectorAll('.card button').forEach(button => {
        button.addEventListener('click', (e) => {

            const card = e.target.closest('.card');

            const name = card.querySelector('p').innerText;

            const priceText = card.querySelector('.price').innerText;
            const price = parseInt(priceText.replace(/[^\d]/g, ''));

            const exists = cart.find(item => item.name === name);
            if (exists) {
                alert("Este juego ya está en el carrito ⚠️");
                return;
            }

            cart.push({ name, price });
            updateCart();
            alert("Se agregó al carrito! 🛒");
        });
    });

    // BOTÓN DEL CARRITO (mostrar/ocultar)
    const cartBtn = document.querySelector('.btn-cart');
    const cartSection = document.getElementById('cart-section');

    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartSection.style.display =
            cartSection.style.display === 'block' ? 'none' : 'block';
    });

    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.cart-container') && !e.target.closest('.btn-cart')) {
            cartSection.style.display = 'none';
        }
    });

});

function irAPagina(url) {
    if (url) {
        window.location.href = url;
    }
}
