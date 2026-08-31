# Web_D2G
Web publica de D2G

## Páginas localizadas

`index.html` es la fuente bilingüe. Tras editarla, regenera las páginas públicas:

```powershell
.\scripts\build-locales.ps1
```

El despliegue debe incluir `es/index.html`, `en/index.html`, `.htaccess` y todos los recursos de la raíz. Para volver a generar favicon e iconos Apple/PWA desde `assets/logo.png`:

```powershell
.\scripts\generate-icons.ps1
```
