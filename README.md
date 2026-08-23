<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Web-blue.svg?style=for-the-badge" alt="Platform">
  
  <h1>🕹️ RETROGAMES PORTAL 🕹️</h1>
  
  <p><strong>Un emulador web multiplataforma con estética Synthwave 80s, soporte para gamepads y guardado en la nube/navegador.</strong></p>

  <h3>🎮 <a href="https://mr-d0nut.github.io/Retrogames/">¡JUEGA AHORA AQUÍ!</a> 🎮</h3>
</div>

<hr>

## 🚀 Características

- **Estética Retro/Synthwave:** Un HUB principal inmersivo con diseño neón, scanlines, y ambiente ochentero.
- **Soporte Nativo de Gamepads:** Conecta tu mando de Xbox, PlayStation o cualquier mando genérico por USB o Bluetooth y juega al instante.
- **Guardado de Partidas (Save States):** Guarda y carga tus partidas directamente desde tu navegador web.
- **Soporte Táctil Integrado:** Controles virtuales en pantalla que aparecen automáticamente al abrirlo desde un móvil o tablet.
- **Generación Automática de Catálogo:** Incluye un script para procesar tu carpeta de ROMs y generar la interfaz del catálogo en segundos.
- **Motor Potente:** Funciona gracias a la fantástica librería [EmulatorJS](https://emulatorjs.org/).

---

## 👾 Consolas Soportadas

| Consola | Estado | Directorio |
| :--- | :---: | :--- |
| **Super Nintendo (SNES)** | 🟢 Activo | `snes/` |
| **Nintendo (NES)** | 🟡 Próximamente | `nes/` |
| **SEGA Mega Drive** | 🟡 Próximamente | `sega/` |

---

## 🛠️ Cómo añadir nuevos juegos (ROMs)

Añadir juegos a tu emulador es muy fácil. El proyecto está preparado para automatizar casi todo el proceso:

### 1. Sube tus juegos
Sube los archivos de tus juegos (se soportan formatos descomprimidos como `.smc`, `.sfc` o comprimidos en `.zip`) a la carpeta correspondiente.
Para SNES:
> `snes/roms/Tu_Juego.zip`

### 2. Sube las carátulas (Opcional)
Para que el menú luzca genial, puedes añadir la portada del juego. El archivo de la imagen debe llamarse **exactamente igual** que la ID que se genera para el juego (normalmente el nombre del juego en minúsculas y separado por guiones).
Súbelas aquí:
> `snes/assets/covers/tu-juego.jpg`

### 3. Actualiza el Catálogo automáticamente
Para que los juegos aparezcan en la web, necesitas actualizar el archivo `games.json`. Puedes hacerlo de forma automática ejecutando nuestro script:

```bash
# Requiere Node.js instalado en tu equipo
node scripts/update-games-json.js
```

Este script leerá tu carpeta de ROMs, limpiará los nombres (quitando etiquetas como `(USA)`) y construirá tu cuadrícula estilo Netflix para la web.

---

## 💻 Desarrollo Local

Si quieres probar la aplicación en tu máquina de forma local, no puedes simplemente abrir el archivo `index.html` debido a las restricciones de seguridad CORS del navegador. 

Necesitas levantar un pequeño servidor estático. Puedes usar cualquier herramienta, por ejemplo con Node.js:

```bash
npx serve .
```
Y luego abre `http://localhost:3000` en tu navegador.

---

<div align="center">
  <i>Insert Coin to Continue...</i>
</div>
