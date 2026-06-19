require("dotenv").config();

const fs = require("fs");
const os = require("os");
const path = require("path");

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
app.use(cors());

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// conexión a Google
// const auth = new google.auth.GoogleAuth({
//     keyFile: "./config/google-credentials.json",
//     scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
// });

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly"
    ],
});

// // ID del Sheet
// const spreadsheets = {
//     A: "1FAojRrSV7PIrftOKlHNp0ua8nLJNZiSd-a2iT9RyyZQ",
//     B: "1QRdl0oI0WyDcBBe7TbDSB42qYHF7TrrbuuBnuXVGFA8",
//     C: "1Z_CYkMGHo4yCgpxS8O_Gd7U3kjxRM3Zx2qG-AiTFm2o",
//     D: "1KHoBn0hjsxuzzB_y4sL2-QoZXQx-v-3nnBqvxGEUAk4",
//     E: "1IF4QamJ1D-h4PWgIv-j4tvsB2Qq0TvVn68yzKXbTrk4",
//     F: "19P-QJh75rVArMahlAs0iy72AREJoHM2Pao7YcpYW7K4",
//     G: "1GxPqTcBfgJ-0iQ9yjk5CL2seBqFjeaRv3V4BTQ41C00",
//     H: "1OlR5IjIl3sv8MJ0sABNt1q-4BSIG12vyECw1ur6xwt4",
//     I: "1PdSfzy9ZdvUQaNejIwZw5ReyqJ1sgX2CmgGu5Y4csBk",
//     J: "1PpEQBFRj0N8-DY-rqLMRf6eaV3xahcoy3LttrW0IHwg",
//     L: "13Gx7kKnARAu_iO9gSshfWFGKOumEzc9Pb75pTjyKz5M",
//     M: "1uunFsLkm6hfmlI42ykFQwVd3rckGojXcJBeD62t-Knk",
//     O: "1qvsRsCo3ad42FA472okatJIraLzQWOEN2Di9XqWbgSw",
//     P: "1x5UmhofGXZe-ESE8Fe9VbC2irTN-7y7HEjCmGBx_Pf8",
//     R: "1eGlYr0n0UgpvT-evOUOxvAz6iOW-Cq6Pu0K6r2ujCls",
//     S: "1vb1tXXiJYW1QWi-sQC-7wf3Jv5FFsuz9DJT9QMFmNnE",
//     T: "1kbuMiDnb7xSFG_EOHKL9zD0ZZV1-W_rglF-3WY4QFwE",
//     V: "1_xiMvIje-2Ww5OSPxmJDANfWZ-7D0ByJm6axWWNznjQ",
//     Y: "1rnaH8a9AQiSYugbcvecaUU_GYHTV0boIh-Ac6Cpf4gE",
// };
const spreadsheets = {
    A: process.env.SPREADSHEET_A,
    B: process.env.SPREADSHEET_B,
    C: process.env.SPREADSHEET_C,
    D: process.env.SPREADSHEET_D,
    E: process.env.SPREADSHEET_E,
    F: process.env.SPREADSHEET_F,
    G: process.env.SPREADSHEET_G,
    H: process.env.SPREADSHEET_H,
    I: process.env.SPREADSHEET_I,
    J: process.env.SPREADSHEET_J,
    L: process.env.SPREADSHEET_L,
    M: process.env.SPREADSHEET_M,
    O: process.env.SPREADSHEET_O,
    P: process.env.SPREADSHEET_P,
    R: process.env.SPREADSHEET_R,
    S: process.env.SPREADSHEET_S,
    T: process.env.SPREADSHEET_T,
    V: process.env.SPREADSHEET_V,
    Y: process.env.SPREADSHEET_Y
};

async function leerHoja(spreadsheetId, sheetName) {

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: "v4",
        auth: client,
    });


    const response = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
    });

    return response.data.values;
}

// function convertirLinkDrive(url) {

//     if (!url) return "";

//     const match = url.match(/\/d\/(.*?)\//);

//     if (!match) return url;

//     const fileId = match[1];

//     return `https://drive.usercontent.google.com/download?id=${fileId}&authuser=0`;
// }

function convertirLinkDrive(url) {

    if (!url) return "";

    const match = url.match(/\/d\/(.*?)\//);

    if (!match) return url;

    const fileId = match[1];

    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

let cacheBusqueda = [];

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

// ============================
// CARGAR TODOS LOS PRODUCTOS
// ============================

async function cargarCacheBusqueda() {

    cacheBusqueda = [];

    for (const letra in spreadsheets) {

        const spreadsheetId = spreadsheets[letra];

        try {

            const client = await auth.getClient();

            const googleSheets = google.sheets({
                version: "v4",
                auth: client,
            });

            const meta =
                await googleSheets.spreadsheets.get({
                    spreadsheetId,
                });

            const hojas =
                meta.data.sheets.map(
                    s => s.properties.title
                );

            for (const hoja of hojas) {

                try {

                    const data =
                        await leerHoja(
                            spreadsheetId,
                            hoja
                        );

                    if (!data || data.length === 0)
                        continue;

                    const headers = data[0];
                    const rows = data.slice(1);

                    rows.forEach(row => {

                        let obj = {};

                        headers.forEach((header, index) => {

                            obj[header.trim()] =
                                row[index];
                        });

                        cacheBusqueda.push({

                            linea: hoja,

                            Nombre:
                                obj.Nombre ||
                                obj.NOMBRE ||
                                "",

                            Clave:
                                obj.Clave || ""
                        });

                    });

                    console.log(
                        "OK hoja:",
                        hoja
                    );

                    await sleep(700);

                } catch (err) {

                    console.log(
                        "Error hoja:",
                        hoja
                    );

                    console.error(err.message);
                }
            }

        } catch (err) {

            console.log(
                "Error spreadsheet:",
                letra
            );

            console.error(err.message);
        }
    }

    console.log(
        "Productos cargados:",
        cacheBusqueda.length
    );
}


app.get("/api/productos/:hoja", async (req, res) => {
    try {

        const hoja = req.params.hoja.trim();

        // detectar letra
        const letra = hoja.charAt(0).toUpperCase();

        // obtener spreadsheet correcto
        const spreadsheetId = spreadsheets[letra];

        if (!spreadsheetId) {

            return res.status(404).json({
                error: "No existe spreadsheet para esta línea"
            });
        }

        const data = await leerHoja(spreadsheetId, hoja);

        if (!data || data.length === 0) {

            return res.status(404).json({
                error: "Hoja vacía o no encontrada"
            });
        }

        const headers = data[0];
        const rows = data.slice(1);

        const productos = rows.map(row => {

            let obj = {};

            headers.forEach((header, index) => {

                const key = header.trim();

                let value = row[index];

                if (key === "Imagenes") {
                    value = convertirLinkDrive(value);
                }

                obj[key] = value;
            });

            return obj;
        });

        res.json({
            hoja,
            total: productos.length,
            productos
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

// // prueba básica
// app.get("/", (req, res) => {
//     res.send("Backend del catálogo funcionando 🚀");
// });

app.get("/api/busqueda", async (req, res) => {

    try {

        const q =
            req.query.q?.toLowerCase().trim();

        if (!q) {

            return res.json([]);
        }

        const resultados =
            cacheBusqueda.filter(producto => {

                const nombre =
                    producto.Nombre
                        ?.toLowerCase() || "";

                const linea =
                    producto.linea
                        ?.toLowerCase() || "";

                return (
                    nombre.includes(q) ||
                    linea.includes(q)
                );
            });

        res.json(
            resultados.slice(0, 20)
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

async function iniciarServidor() {


    await cargarCacheBusqueda();

    // app.listen(3000, () => {

    //     console.log(
    //         "Servidor corriendo en http://localhost:3000"
    //     );

    // });

    const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

}

// Mostrar el frontend para cualquier ruta
app.use((req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );
});

iniciarServidor();