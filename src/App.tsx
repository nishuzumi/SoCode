import { Notebook } from "@/components/Notebook";
import "./App.css";
import { DevTools } from "jotai-devtools";
import 'jotai-devtools/styles.css'
function App() {
  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white">
        <Notebook />
      </div>
      <DevTools />
    </>
  );
}

export default App;
