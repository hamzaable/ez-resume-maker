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
  IconButton,
  Tooltip,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import html2pdf from 'html2pdf.js';
import { useResume } from '../context/ResumeContext';
import DocumentControls from './DocumentControls';
import { KeyboardEvent, useRef } from 'react';

interface EditableSpanProps {
  content: string;
  onUpdate: (newContent: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

const EditableSpan: React.FC<EditableSpanProps> = ({ content, onUpdate, style, className }) => {
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    onUpdate(e.target.textContent || '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{ ...style, cursor: 'text', outline: 'none' }}
      className={className}
    >
      {content}
    </span>
  );
};

export default function Preview() {
  const navigate = useNavigate();
  const { resumeData, updateContact, updateSummary, updateDocumentStyle, importData, exportData, resetData } = useResume();
  const { documentStyle } = resumeData;
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportJSON = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          importData(jsonData);
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      resetData();
    }
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
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />
          <Tooltip title="Import JSON">
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 1 }}
            >
              <UploadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export JSON">
            <IconButton
              color="primary"
              onClick={handleExportJSON}
              sx={{ mr: 1 }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Data">
            <IconButton
              color="error"
              onClick={handleReset}
              sx={{ mr: 2 }}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
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
          <Typography variant="h4" component="div" gutterBottom>
            <EditableSpan
              content={resumeData.contact.fullName}
              onUpdate={(value) => updateContact({ ...resumeData.contact, fullName: value })}
              style={{
                ...getContentStyle(),
                fontSize: `${documentStyle.fontSize * 1.5}pt`,
                fontWeight: 'bold',
              }}
            />
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <EditableSpan
              content={resumeData.contact.email}
              onUpdate={(value) => updateContact({ ...resumeData.contact, email: value })}
              style={getContentStyle()}
            />
            <EditableSpan
              content={resumeData.contact.phone}
              onUpdate={(value) => updateContact({ ...resumeData.contact, phone: value })}
              style={getContentStyle()}
            />
            <EditableSpan
              content={resumeData.contact.linkedin}
              onUpdate={(value) => updateContact({ ...resumeData.contact, linkedin: value })}
              style={getContentStyle()}
            />
          </Box>

          {resumeData.contact.website && (
            <Box sx={{ mb: 2 }}>
              <EditableSpan
                content={resumeData.contact.website}
                onUpdate={(value) => updateContact({ ...resumeData.contact, website: value })}
                style={getContentStyle()}
              />
            </Box>
          )}

          <Box sx={{ mt: 2, mb: 4, display: 'flex', gap: 2 }}>
            {resumeData.contact.country && (
              <EditableSpan
                content={resumeData.contact.country}
                onUpdate={(value) => updateContact({ ...resumeData.contact, country: value })}
                style={getContentStyle()}
              />
            )}
            {resumeData.contact.state && (
              <EditableSpan
                content={resumeData.contact.state}
                onUpdate={(value) => updateContact({ ...resumeData.contact, state: value })}
                style={getContentStyle()}
              />
            )}
          </Box>

          {resumeData.summary && (
            <>
              <Typography variant="h5" gutterBottom sx={getContentStyle()}>
                Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <EditableSpan
                  content={resumeData.summary}
                  onUpdate={updateSummary}
                  style={getContentStyle()}
                />
              </Box>
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