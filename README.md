# Microfrontends con React (con Vite + Module Federation)

Estructura análoga a los microservicios. Requiere crear previamente un directorio para alojar los frontends componentes.

## Comandos

Fundamentalmente deben haber dos clases de aplicaciones:
1. **Aplicación host**: una aplicación que pueda acceder a otras de manera centralizada.
2. **Aplicaciones cliente o remotas**: las que exponen los componentes aplicativos a la aplicación host.

### Crear aplicación remota
```sh
npm create vite remote --template react
```
Entrar a remote y ejecutar:
```sh
npm i
```

Instalar el Vite Plugin Federation:
```
npm install @originjs/vite-plugin-federation --save-dev
```

En remote, modificar el package.json:
```json
  "scripts": {
    "dev": "vite --port 3001 --strictPort",
    "build": "vite build",
    "preview": "vite preview --port 3001 --strictPort",
    "serve": "vite preview --port 3001 --strictPort"
  },
```

Puede ser 3001 u otro valor deseado.

Instalar Jotai para transferencia de estado remota
```sh
npm i jotai
```

### Crear aplicación host

Proceder los pasos de la aplicación remota, pero sin necesidad de cambiar el puerto ni instalar Jotai.

## Configuración de comunicación de microfrontends

### Configurar la app remota

En vite.config.js agregar:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from "@originjs/vite-plugin-federation";  // <---------- importar

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "remote_app", // <------- nombre del app que se compartirá con el host
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/Button",  // <---------- agregar los fuentes compartidos
        "./store": "./src/store",
      },
      shared: ["react", "react-dom", "jotai"], // <---------- agregar los plugins compartidos
    }),
  ],
  build: {  // <---------- generar build
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})
```

Una vez construida la configuración ejecutar:
```sh
npm run build
npm run serve
```

### Configurar la app host

En vite.config.js agregar:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from "@originjs/vite-plugin-federation"; // <----- agregar

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({ // <----- agregar
      name: "app",
      remotes: {
        remoteApp: "http://localhost:3001/assets/remoteEntry.js", // <----- agregar app remota a consumir
      },
      shared: ["react", "react-dom"], // <----- agregar
    }),
  ],
  build: { // <----- agregar para el build
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
})
```

En la aplicación:

```javascript
import './App.css'

// importar desde la aplicación remota
import Button from "remoteApp/Button";
import useStore from "remoteApp/store";

function App() {
  const [count, setCount] = useStore();

  return (
    <div className="App">
      <h1>Vite + React (Host)</h1>
      {/* Consumo el botón de la aplicación remota */}
      <Button />
      <div className="card">
        {/* Consumo el store del estado de la aplicación remota */}
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
```

Notar que se consume el plugin Jotai proveniente de la aplicación remota, como también cualquier gestor de estados (Redux, Zustand, etc.) puede ser compartido.

Luego ejecutar en consola:
```sh
npm run build
npm run preview
```

## NOTA
Las aplicaciones deben detenerse y ejecutar los comandos para build y serve/preview para refrescar los cambios.

## Jotai
Una alternativa a Redux, Zustand, etcétera, para gestión de estados. Se basa en el uso de átomos.

Instalación
```sh
npm i jotai
```

Crear un store:
```javascript
import { atom, useAtom } from "jotai";

const countAtom = atom(0);

const useCount = () => useAtom(countAtom);

export default useCount;
```

Usar el store:

```javascript
import "./Button.css";
import useCount from "./store";

export const Button = () => {
  const [state, setState] = useCount();
  return (
    <div>
      <button className="shared-btn" onClick={() => setState((s) => s + 1)}>
        Click me: {state}
      </button>
    </div>
  );
};

export default Button;
```

## Agradecimientos
Thanks to @jherr for his [tutorial](https://youtu.be/t-nchkL9yIg?si=rNcSc2MZ0_9MEDx7)!
