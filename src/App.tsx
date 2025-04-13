import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ResumeBuilder from './components/ResumeBuilder';
import Preview from './components/Preview';
import { ResumeProvider } from './context/ResumeContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ResumeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ResumeBuilder />} />
            <Route path="/preview" element={<Preview />} />
          </Routes>
        </Router>
      </ResumeProvider>
    </ThemeProvider>
  );
}

export default App;
