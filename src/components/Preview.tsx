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
  TextField,
} from '@mui/material';
import html2pdf from 'html2pdf.js';
import { useResume } from '../context/ResumeContext';
import DocumentControls from './DocumentControls';

export default function Preview() {
  const navigate = useNavigate();
  const { resumeData, updateContact, updateSummary, updateDocumentStyle } = useResume();
  const { documentStyle } = resumeData;

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    const opt = {
      margin: [documentStyle.margins, documentStyle.margins],
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const getContentStyle = () => ({
    fontFamily: documentStyle.font.toLowerCase().replace(/_/g, ' '),
    fontSize: `${documentStyle.fontSize}pt`,
    lineHeight: documentStyle.lineSpacing,
  });

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

      <DocumentControls
        font={documentStyle.font}
        fontSize={documentStyle.fontSize}
        lineSpacing={documentStyle.lineSpacing}
        margins={documentStyle.margins}
        onFontChange={(font) => updateDocumentStyle({ font })}
        onFontSizeChange={(fontSize) => updateDocumentStyle({ fontSize })}
        onLineSpacingChange={(lineSpacing) => updateDocumentStyle({ lineSpacing })}
        onMarginsChange={(margins) => updateDocumentStyle({ margins })}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper
          id="resume-preview"
          sx={{
            p: `${documentStyle.margins}mm`,
            minHeight: '297mm',
            width: '210mm',
            margin: '0 auto',
            backgroundColor: 'white',
            color: 'black',
            ...getContentStyle(),
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            InputProps={{
              style: {
                ...getContentStyle(),
                fontSize: `${documentStyle.fontSize * 1.5}pt`,
                fontWeight: 'bold',
              },
            }}
            value={resumeData.contact.fullName}
            onChange={(e) => updateContact({ ...resumeData.contact, fullName: e.target.value })}
          />

          <Box sx={{ mb: 3 }}>
            <TextField
              variant="standard"
              size="small"
              value={resumeData.contact.email}
              onChange={(e) => updateContact({ ...resumeData.contact, email: e.target.value })}
              sx={{ mr: 2 }}
            />
            <TextField
              variant="standard"
              size="small"
              value={resumeData.contact.phone}
              onChange={(e) => updateContact({ ...resumeData.contact, phone: e.target.value })}
              sx={{ mr: 2 }}
            />
            <TextField
              variant="standard"
              size="small"
              value={resumeData.contact.linkedin}
              onChange={(e) => updateContact({ ...resumeData.contact, linkedin: e.target.value })}
            />
          </Box>

          {resumeData.contact.website && (
            <TextField
              fullWidth
              variant="standard"
              size="small"
              value={resumeData.contact.website}
              onChange={(e) => updateContact({ ...resumeData.contact, website: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ mt: 2, mb: 4 }}>
            {resumeData.contact.country && (
              <TextField
                variant="standard"
                size="small"
                value={resumeData.contact.country}
                onChange={(e) => updateContact({ ...resumeData.contact, country: e.target.value })}
                sx={{ mr: 2 }}
              />
            )}
            {resumeData.contact.state && (
              <TextField
                variant="standard"
                size="small"
                value={resumeData.contact.state}
                onChange={(e) => updateContact({ ...resumeData.contact, state: e.target.value })}
              />
            )}
          </Box>

          {resumeData.summary && (
            <>
              <Typography variant="h5" gutterBottom sx={getContentStyle()}>
                Summary
              </Typography>
              <TextField
                fullWidth
                multiline
                variant="standard"
                value={resumeData.summary}
                onChange={(e) => updateSummary(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.experiences.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={getContentStyle()}>
                Experience
              </Typography>
              {resumeData.experiences.map((exp, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={getContentStyle()}>
                    {exp.position} at {exp.company}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary" sx={getContentStyle()}>
                    {exp.startDate} - {exp.endDate}
                  </Typography>
                  <Typography variant="body1" sx={getContentStyle()}>
                    {exp.description}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.education.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={getContentStyle()}>
                Education
              </Typography>
              {resumeData.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={getContentStyle()}>
                    {edu.degree} in {edu.field}
                  </Typography>
                  <Typography variant="subtitle1" sx={getContentStyle()}>
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={getContentStyle()}>
                    {edu.startDate} - {edu.endDate}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {resumeData.skills.length > 0 && (
            <>
              <Typography variant="h5" gutterBottom sx={getContentStyle()}>
                Skills
              </Typography>
              <Typography variant="body1" sx={getContentStyle()}>
                {resumeData.skills.join(', ')}
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}