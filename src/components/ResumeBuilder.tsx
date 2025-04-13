import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import ContactForm from './sections/ContactForm';
import ExperienceForm from './sections/ExperienceForm';
import EducationForm from './sections/EducationForm';
import SkillsForm from './sections/SkillsForm';
import SummaryForm from './sections/SummaryForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePreview = () => {
    navigate('/preview');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Builder
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreview}
          >
            Finish Up & Preview
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="resume sections"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Contact" />
            <Tab label="Experience" />
            <Tab label="Education" />
            <Tab label="Skills" />
            <Tab label="Summary" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ContactForm />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ExperienceForm />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <EducationForm />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <SkillsForm />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <SummaryForm />
        </TabPanel>
      </Container>
    </Box>
  );
}