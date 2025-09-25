import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AI from "./pages/ai/page";
import Serien from "./pages/ai/Serien";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<Serien />} />
            </Routes>
        </Router>
    );
}

export default App;
