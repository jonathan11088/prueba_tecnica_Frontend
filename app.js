const API_URL = 'http://localhost:3000';

// Elementos del DOM
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const productForm = document.getElementById('product-form');
const productsList = document.getElementById('products-list');
const userDisplay = document.getElementById('user-display');

const prodIdInput = document.getElementById('prod-id');
const prodNombreInput = document.getElementById('prod-nombre');
const prodDescripcionInput = document.getElementById('prod-descripcion');
const formTitle = document.getElementById('form-title');
const btnCancelEdit = document.getElementById('btn-cancel-edit');


const fetchConfig = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' 
};

// --- LOGIC: AUTENTICACIÓN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('login-correo').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Login correcto!');
            userDisplay.textContent = `Usuario: ${data.usuario.correo}`;
            
            
            authSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            // Cargar productos una vez logueado
            cargarProductos();
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error(error);
        alert('No se pudo conectar con el servidor.');
    }
});


//  LOGICA: CRUD PRODUCTOS 

// 1. OBTENER (READ)
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`, fetchConfig);
        const productos = await response.json();

        productsList.innerHTML = ''; // Limpiar lista
        
        if (productos.length === 0) {
            productsList.innerHTML = '<p>No hay productos registrados.</p>';
            return;
        }

        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${p.nombre_producto}</h4>
                <p>${p.descripcion_producto}</p>
                <div class="actions">
                    <button onclick="prepararEdicion(${p.id_producto}, '${p.nombre_producto}', '${p.descripcion_producto}')">Editar</button>
                    <button class="danger" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
                </div>
            `;
            productsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// 2. CREAR Y ACTUALIZAR 
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = prodIdInput.value;
    const nombre_producto = prodNombreInput.value;
    const descripcion_producto = prodDescripcionInput.value;

    const payload = { nombre_producto, descripcion_producto };
    
    let url = `${API_URL}/productos`;
    let method = 'POST';

    
    if (id) {
        url = `${API_URL}/productos/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            ...fetchConfig,
            method: method,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            productForm.reset();
            resetFormularioEdicion();
            cargarProductos(); 
        }
    } catch (error) {
        console.error('Error al guardar:', error);
    }
});

// 3. ELIMINAR 
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            ...fetchConfig,
            method: 'DELETE'
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            cargarProductos();
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}


window.prepararEdicion = function(id, nombre, descripcion) {
    formTitle.textContent = 'Editar';
    prodIdInput.value = id;
    prodNombreInput.value = nombre;
    prodDescripcionInput.value = descripcion;
    btnCancelEdit.classList.remove('hidden');
};

btnCancelEdit.addEventListener('click', resetFormularioEdicion);

function resetFormularioEdicion() {
    formTitle.textContent = 'Crear';
    prodIdInput.value = '';
    productForm.reset();
    btnCancelEdit.classList.add('hidden'); 
}