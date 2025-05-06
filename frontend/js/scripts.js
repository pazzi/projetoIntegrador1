// Variáveis globais
let currentUser = null;
let cart = [];
let categories = [];
let products = [];

// Elementos do DOM
const authSection = document.getElementById('auth-section');
const productsSection = document.getElementById('products-section');
const cartSection = document.getElementById('cart-section');
const ordersSection = document.getElementById('orders-section');
const userInfoDiv = document.getElementById('user-info');
const categoriesDiv = document.getElementById('categories');
const productsListDiv = document.getElementById('products-list');
const cartItemsDiv = document.getElementById('cart-items');
const cartTotalDiv = document.getElementById('cart-total');
const ordersListDiv = document.getElementById('orders-list');

// Event Listeners
document.getElementById('showRegister').addEventListener('click', showRegisterForm);
document.getElementById('showLogin').addEventListener('click', showLoginForm);
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('checkout-btn').addEventListener('click', checkout);
document.getElementById('continue-shopping').addEventListener('click', continueShopping);
document.getElementById('back-to-products').addEventListener('click', showProductsSection);

// Funções para alternar entre seções
function showLoginForm(e) {
    e.preventDefault();
    //document.getElementById('register-form').style.display('none');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegisterForm(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    //document.getElementById('login-form').style.display('hidden');
    //document.getElementById('register-form').style.display('block');
}

function showProductsSection() {
    document.getElementById('login-form').classList.add('hidden');

    //authSection.classList.remove('active');
    productsSection.classList.add('active');
    cartSection.classList.add('active');
    //cartSection.classList.remove('active');
    //document.getElementById('cart-section').classList.add('block');
    ordersSection.classList.remove('active');
    loadProducts();
}

function showCartSection() {
    authSection.classList.remove('active');
    productsSection.classList.remove('active');
    cartSection.classList.add('active');
    ordersSection.classList.remove('active');
    renderCart();
}

function showOrdersSection() {
    authSection.classList.remove('active');
    productsSection.classList.remove('active');
    cartSection.classList.remove('active');
    ordersSection.classList.add('active');
    loadUserOrders();
}

// Funções de autenticação
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); // Armazena o token
            currentUser = data.user;
            updateUIAfterLogin();
            showProductsSection();
            //renderCart();
        } else {
            alert(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    const password = document.getElementById('registerPassword').value;
console.log(name, email, phone, address, password);
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, address, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            showLoginForm(e);
        } else {
            alert(data.message || 'Erro ao cadastrar');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function updateUIAfterLogin() {
    userInfoDiv.innerHTML = `
        <span>Olá, ${currentUser.name}!</span>
        <button onclick="logout()">Sair</button>
        <button onclick="showOrdersSection()">Meus Pedidos</button>
    `;
}

function logout() {
    currentUser = null;
    cart = [];
    userInfoDiv.innerHTML = '';
    authSection.classList.add('active');
    productsSection.classList.remove('active');
    cartSection.classList.remove('active');
    ordersSection.classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');

    localStorage.removeItem('token');
    currentUser = null;
    // Redireciona para a página de login ou recarrega
    window.location.href = 'index.html';
}

// Funções de produtos
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (response.ok) {
            products = data.products;
            categories = data.categories;
            renderCategories();
            renderProducts();

        } else {
            console.error('Erro ao carregar produtos:', data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderCategories() {
    categoriesDiv.innerHTML = '';
    
    // Botão "Todos"
    const allButton = document.createElement('button');
    allButton.className = 'category-btn active';
    allButton.textContent = 'Todos';
    allButton.onclick = () => filterProductsByCategory(null);
    categoriesDiv.appendChild(allButton);
    
    // Categorias
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category.name;
        button.onclick = () => filterProductsByCategory(category.id);
        categoriesDiv.appendChild(button);
    });
}

function filterProductsByCategory(categoryId) {
    // Atualiza botões ativos
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (categoryId === null) {
        document.querySelectorAll('.category-btn')[0].classList.add('active');
        renderProducts();
    } else {
        const activeBtn = [...document.querySelectorAll('.category-btn')].find(
            btn => btn.textContent === categories.find(c => c.id === categoryId).name
        );
        if (activeBtn) activeBtn.classList.add('active');
        
        const filteredProducts = products.filter(p => p.category_id === categoryId);
        renderProducts(filteredProducts);
    }
}

function renderProducts(productsToRender = products) {
    productsListDiv.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productsListDiv.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }
    
    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.image_url || 'https://via.placeholder.com/250'}')"></div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="product-price">R$ ${product.price}</div>
                <button class="add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    productsListDiv.appendChild(productGrid);
    
    // Adiciona event listeners aos botões
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}


function addToCart(e) {
    // 1. Obter o productId corretamente
    const productId = parseInt(e.target.getAttribute('data-id'));
    if (isNaN(productId)) {
        console.error('ID do produto inválido');
        return;
    }

    // 2. Encontrar o produto na lista de produtos
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Produto não encontrado com ID:', productId);
        return;
    }

    // 3. Debug: Mostrar o carrinho antes da busca
    console.log('Carrinho antes:', cart);

    // 4. Procurar item existente com verificação robusta
    const existingItem = cart.find(item => {
        // Verifica se item e item.product existem
        if (!item || !item.product) return false;
        
        // Compara IDs convertendo ambos para Number
        return Number(item.product.id) === Number(productId);
    });

    // 5. Debug: Mostrar resultado da busca
    console.log('Item existente:', existingItem);

    // 6. Adicionar ao carrinho ou incrementar quantidade
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Quantidade incrementada para:', existingItem.quantity);
    } else {
        cart.push({
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url
            },
            quantity: 1
        });
        console.log('Novo item adicionado ao carrinho');
    }

    // 7. Debug: Mostrar carrinho após alteração
    console.log('Carrinho depois:', cart);

    // 8. Feedback visual
    const button = e.target;
    button.textContent = '✔ Adicionado!';
    button.disabled = true;
    setTimeout(() => {
        button.textContent = 'Adicionar ao Carrinho';
        button.disabled = false;
    }, 1000);

    // 9. Atualizar visualização do carrinho (se aplicável)
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
}

// Funções do carrinho
function renderCart() {

    cartItemsDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Seu carrinho está vazio.</p>';
        cartTotalDiv.textContent = 'Total: R$ 0,00';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div>
                <h4>${item.product.name}</h4>
                <p>R$ ${item.product.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <button onclick="updateCartItem(${item.product.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartItem(${item.product.id}, 1)">+</button>
                <button onclick="removeCartItem(${item.product.id})">Remover</button>
            </div>
        `;
        
        cartItemsDiv.appendChild(cartItem);
    });
    
    updateCartTotal();
}

// Atualiza quantidade de um item
function updateCartItem(productId, change) {
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // Remove se quantidade chegar a zero
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateCartDisplay();
    }
}

// Remove item completamente
function removeCartItem(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartDisplay();

}
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cartTotalDiv.textContent = `Total: R$ ${total}`;
}

/*
document.getElementById('cart-toggle').addEventListener('click', () => {
    const cart = document.getElementById('cart-container');
    cart.classList.toggle('hidden');
});
*/


function updateCartDisplay() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartContainer = document.getElementById('cart-container');
    
    // Mostra o container do carrinho se não estiver vazio
    /*
    if (cart.length > 0) {
        cartContainer.classList.remove('hidden');
    } else {
        cartContainer.classList.add('hidden');

        return;
    }
*/
    // Limpa itens anteriores
    cartItemsElement.innerHTML = '';

    // Adiciona cada item do carrinho
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.product.name}</h4>
                <p>R$ ${item.product.price}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateCartItem(${item.product.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartItem(${item.product.id}, 1)">+</button>
                <button onclick="removeCartItem(${item.product.id})">Remover</button>
            </div>
            <div class="cart-item-subtotal">
                R$ ${(item.product.price * item.quantity).toFixed(2)}
            </div>
        `;
        
        cartItemsElement.appendChild(itemElement);
    });

    // Atualiza o total
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cartTotalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

/*
const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
*/


function continueShopping() {
    showProductsSection();
}

// Funções de pedido
async function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    if (!currentUser) {
        alert('Por favor, faça login para finalizar o pedido.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                totalAmount: total,
                deliveryAddress: currentUser.address,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.product.price
                }))
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Pedido realizado com sucesso!');
            cart = [];
            showOrdersSection();
        } else {
            alert(data.message || 'Erro ao finalizar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function loadUserOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/orders/user/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            renderOrders(data.orders);
        } else {
            console.error('Erro ao carregar pedidos:', data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderOrders(orders) {
    ordersListDiv.innerHTML = '';
    
    if (orders.length === 0) {
        ordersListDiv.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
        return;
    }
    console.log('orders:',orders);
    orders.forEach(order => {

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

  
        const statusClass = `status-${order.status}`;
        orderCard.innerHTML = `
            <div>
                <h3>Pedido #${order.id}</h3>
                <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <p><strong>Itens:</strong> ${order.items} - Qtd: ${order.quantity} 
            - Preço do item: ${order.unit_price} - Preço total: R$ ${order.total_amount}</p>
            <!--p><strong>Total:</strong> R$ ${order.total_amount}</p-->
        `;
        
        ordersListDiv.appendChild(orderCard);
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há um usuário logado (token no localStorage)
    const token = localStorage.getItem('token');
    if (token) {
        // Fazer uma requisição para verificar o token e obter os dados do usuário
        // Se válido, atualizar currentUser e chamar updateUIAfterLogin()
    }
});