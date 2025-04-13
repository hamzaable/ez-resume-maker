import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import html2pdf from 'html2pdf.js';
import { useResume } from '../context/ResumeContext';

export default function Preview() {
  const navigate = useNavigate();
  const { resumeData } = useResume();

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    const opt = {
      margin: 1,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Preview
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF}
            sx={{ mr: 2 }}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Back to Editor
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper
          id="resume-preview"
          sx={{
            p: 4,
            minHeight: '29.7cm',
            width: '21cm',
            margin: '0 auto',
            backgroundColor: 'white',
            color: 'black',
          }}
        >
          <Typography variant="h4" gutterBottom>
            {resumeData.contact.fullName}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" component="span" sx={{ mr: 2 }}>
              {resumeData.contact.email}
            </Typography>
            <Typography variant="body1" component="span" sx={{ mr: 2 }}>
              {resumeData.contact.phone}
            </Typography>
            <Typography variant="body1" component="span">
              {resumeData.contact.linkedin}
            </Typography>
          </Box>

          {resumeData.contact.website && (
            <Typography variant="body1" gutterBottom>
              {resumeData.contact.website}
            </Typography>
          )}

          <Box sx={{ mt: 2, mb: 4 }}>
            {resumeData.contact.country && (
              <Typography variant="body1" component="span" sx={{ mr: 2 }}>
                {resumeData.contact.country}
              </Typography>
            )}
            {resumeData.contact.state && (
              <Typography variant="body1" component="span">
                {resumeData.contact.state}
              </Typography>
            )}
          </Box>

          {resumeData.summary && (
            <>
              <Typography variant="h5" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {resumeData.summary}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.experiences.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Experience
              </Typography>
              {resumeData.experiences.map((exp, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    {exp.position} at {exp.company}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    {exp.startDate} - {exp.endDate}
                  </Typography>
                  <Typography variant="body1">
                    {exp.description}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.education.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Education
              </Typography>
              {resumeData.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    {edu.degree} in {edu.field}
                  </Typography>
                  <Typography variant="subtitle1">
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {edu.startDate} - {edu.endDate}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.skills.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Skills
              </Typography>
              <Typography variant="body1">
                {resumeData.skills.join(', ')}
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}