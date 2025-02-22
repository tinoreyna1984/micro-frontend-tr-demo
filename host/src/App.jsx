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
      <p>Remote object: </p>
      <Button />
      <div className="card">
        {/* Consumo el store del estado de la aplicación remota */}
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count} (remote state)
        </button>
      </div>
    </div>
  )
}

export default App
