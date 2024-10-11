import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import FlowEditor from './components/FlowEditor';
import ManageFlows from './components/ManageFlows';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<FlowEditor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manage-flows" element={<ManageFlows />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;