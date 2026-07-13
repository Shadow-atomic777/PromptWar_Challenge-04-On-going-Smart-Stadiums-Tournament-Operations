import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import OpsDashboard from './pages/OpsDashboard';
import FanApp from './pages/FanApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ops" element={<OpsDashboard />} />
        <Route path="/fan" element={<FanApp />} />
      </Routes>
    </Router>
  );
}

export default App;
