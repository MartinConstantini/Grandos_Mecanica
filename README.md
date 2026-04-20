# Sistema de taller compatible con Netlify

Este proyecto fue diseñado para ejecutarse como sitio estático en Netlify o localmente en cualquier servidor estático.

## Tecnologías
- HTML5
- CSS3
- JavaScript ES Modules
- Chart.js
- localStorage para persistencia inmediata

## Importante
Netlify no ejecuta PHP en runtime de sitio, por lo que esta solución usa frontend estático. Si más adelante quieres persistencia multiusuario real, puedes migrar la capa de datos a:
- Firebase Firestore
- Supabase
- Netlify Functions con backend compatible

## Ejecución local
Puedes abrir `index.html` con una extensión de servidor local o usar uno de estos comandos:

### Python
```bash
python -m http.server 8080
```

### Node
```bash
npx serve .
```

## Despliegue en Netlify
1. Sube la carpeta `app` al repositorio.
2. Configura el directorio de publicación como `/`.
3. No necesitas comando de build.
4. Despliega.

## Módulos del sistema
- Dashboard con métricas
- Citas
- Diagnóstico y reparación
- Gastos
- Red e internet
- Escáneres y equipos
- Reportes exportables CSV/JSON

## Persistencia
Por defecto guarda en `localStorage`, por lo que:
- funciona sin base de datos
- funciona desplegado en Netlify
- conserva datos en el navegador del usuario

## Estructura
```text
app/
├── index.html
├── netlify.toml
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js
        ├── config.js
        └── storage.js
```
