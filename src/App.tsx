import "./App.css"
import { BrowserRouter, Route } from "react-router-dom"
import WorkPlace from "./pages/work-place"
import widgetsCenter from "./widgets"

function App() {
  return <div>
    <BrowserRouter>
      <Route>
        <WorkPlace widgetsCenter={ widgetsCenter } />
      </Route>
    </BrowserRouter>
  </div>
}

export default App
