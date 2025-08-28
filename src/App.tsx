import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AI from "./pages/ai/page";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<AI />} />
            </Routes>
        </Router>
    );
}

export default App;
