const API_URL = "";

const params = new URLSearchParams(window.location.search);

const linea = params.get("linea");

console.log("Línea:", linea);

// ==========================
// LISTA DE PRODUCTOS
// ==========================

async function cargarProductos() {

    if (!linea) return;

    const lineTitle =
        document.getElementById("lineTitle");

    if (lineTitle) {
        lineTitle.textContent = linea;
    }

    try {

        const response = await fetch(
    `${API_URL}/api/productos/${encodeURIComponent(linea)}`
);

        const data =
            await response.json();

        console.log(data);

        const productos =
            Array.isArray(data)
                ? data
                : data.productos || [];

        console.log(productos);

        const productsList =
            document.getElementById("productsList");

        // si no existe estamos en producto.html
        if (!productsList) return;

        productsList.innerHTML = "";

        // SI NO HAY PRODUCTOS
        if (productos.length === 0) {

            productsList.innerHTML = `
                <p>No se encontraron productos.</p>
            `;

            return;
        }

        productos.forEach(producto => {

            const a = document.createElement("a");

            a.className = "product-item";

            a.href =
                `producto.html?linea=${encodeURIComponent(linea)}&clave=${producto.Clave}`;

            a.textContent = producto.Nombre;

            productsList.appendChild(a);

        });

    } catch (error) {

        console.error(error);

    }
}

cargarProductos();


// ==========================
// PRODUCTO INDIVIDUAL
// ==========================

const clave = params.get("clave");

console.log("Clave:", clave);

async function cargarProducto() {

    // detectar si estamos en producto.html
    const productName =
        document.getElementById("productName");

    if (!productName) return;

    try {

        const response = await fetch(
            `${API_URL}/api/productos/${encodeURIComponent(linea)}`
        );

        const data = await response.json();

        // buscar producto por clave
        const producto = data.productos.find(p =>
            p.Clave == clave
        );

        console.log(producto);

        // si no existe
        if (!producto) {

            productName.textContent =
                "Producto no encontrado";

            return;
        }

        // llenar datos
        document.getElementById("productLine")
            .textContent = linea;

        document.getElementById("productName")
            .textContent = producto.Nombre || "";

        document.getElementById("productDescription")
            .textContent = producto.Descripcion || "";

        document.getElementById("productCode")
            .textContent = producto.Clave || "";

        // IMAGEN
        document.getElementById("productImage")
            .src = producto.Imagenes || "";

        console.log(producto.Imagenes);

    } catch (error) {

        console.error(error);

    }
}

cargarProducto();

// ==========================
// SEARCH GLOBAL
// ==========================

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");

if (searchInput) {

    searchInput.addEventListener("input", async (e) => {

        const value = e.target.value.trim();

        if (value.length < 2) {

            searchResults.style.display = "none";

            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/busqueda?q=${encodeURIComponent(value)}`
            );

            const data = await response.json();

            searchResults.innerHTML = "";

            if (data.length === 0) {

                searchResults.innerHTML = `
                    <div class="search-result-item">
                        No se encontraron productos
                    </div>
                `;

                searchResults.style.display = "block";

                return;
            }

            data.forEach(producto => {

                const a =
                    document.createElement("a");

                a.className =
                    "search-result-item";

                a.href =
                    `producto.html?linea=${encodeURIComponent(producto.linea)}&clave=${producto.Clave}`;

                a.innerHTML = `
                    <div>${producto.Nombre}</div>
                    <div class="search-result-line">
                        ${producto.linea}
                    </div>
                `;

                searchResults.appendChild(a);
            });

            searchResults.style.display = "block";

        } catch (error) {

            console.error(error);
        }
    });

    // cerrar resultados
    document.addEventListener("click", (e) => {

        if (
            !searchInput.contains(e.target) &&
            !searchResults.contains(e.target)
        ) {

            searchResults.style.display = "none";
        }
    });

    
}