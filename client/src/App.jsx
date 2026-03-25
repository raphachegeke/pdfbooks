import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
    return (
        <Router>
            <div>
                {/* Navigation Bar */}
                <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold' }}>Book Store</Link>
                    <Link to="/admin" style={{ textDecoration: 'none' }}>Admin Panel</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>

                {/* Toast Notifications Container */}
                <ToastContainer />
            </div>
        </Router>
    );
}

export default App;