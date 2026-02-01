import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import About from './pages/About';
import ToastContainer from './components/ToastContainer';

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </Layout>
                <ToastContainer />
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
