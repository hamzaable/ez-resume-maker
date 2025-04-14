import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import html2pdf from 'html2pdf.js';
import { useResume } from '../context/ResumeContext';
import DocumentControls from './DocumentControls';
import { KeyboardEvent, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FormatToolbar from './FormatToolbar';

interface EditableSpanProps {
  content: string;
  onUpdate: (newContent: string) => void;
  style?: React.CSSProperties;
  className?: string;
  allowFormatting?: boolean;
}

const EditableSpan: React.FC<EditableSpanProps> = ({ content, onUpdate, style, className, allowFormatting = false }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    onUpdate(e.target.innerHTML);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleMouseUp = () => {
    if (!allowFormatting) return;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && spanRef.current) {
      setAnchorEl(spanRef.current);
    }
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <>
      <span
        ref={spanRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        style={{ ...style, cursor: 'text', outline: 'none' }}
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {allowFormatting && (
        <FormatToolbar
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          onFormat={handleFormat}
        />
      )}
    </>
  );
};

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface SortableSectionProps {
  id: string;
  children: React.ReactNode;
}

function SortableSection({ id, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ mb: 3, position: 'relative' }}>
        <Box
          {...attributes}
          {...listeners}
          sx={{
            position: 'absolute',
            left: -30,
            top: 0,
            cursor: 'grab',
            opacity: 0.3,
            '&:hover': { opacity: 1 },
            '@media print': {
              display: 'none'
            },
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <DragIndicatorIcon />
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default function Preview() {
  const navigate = useNavigate();
  const {
    resumeData,
    updateContact,
    updateSummary,
    updateDocumentStyle,
    importData,
    exportData,
    resetData,
    updateExperiences,
    updateEducation
  } = useResume();
  const { documentStyle } = resumeData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<Section[]>([
    { id: 'summary', title: 'SUMMARY', content: null },
    { id: 'experience', title: 'EXPERIENCE', content: null },
    { id: 'education', title: 'EDUCATION', content: null },
    { id: 'skills', title: 'SKILLS', content: null },
    { id: 'courses', title: 'COURSES', content: null },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = sections.findIndex(
        (section) => section.id === over.id
      );

      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        logging: false,
        removeContainer: true,
        scrollY: -window.scrollY
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
        precision: 16
      }
    };

    // Add a class to hide drag handles during PDF generation
    element?.classList.add('printing');

    // Temporarily adjust the element's style for PDF generation
    if (element) {
      const originalStyle = element.style.cssText;
      element.style.padding = '20mm';
      element.style.margin = '0';
      element.style.boxShadow = 'none';

      html2pdf().set(opt).from(element).save().then(() => {
        // Restore original styles and remove printing class
        element.style.cssText = originalStyle;
        element.classList.remove('printing');
      });
    }
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

  const renderContactIcon = (icon: React.ReactNode, content: string, onUpdate: (value: string) => void) => {
    if (!content) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
        {icon}
        <EditableSpan
          content={content}
          onUpdate={onUpdate}
          style={getContentStyle()}
        />
      </Box>
    );
  };

  const renderSectionTitle = (title: string) => (
    <Typography
      variant="h6"
      sx={{
        ...getContentStyle(),
        borderBottom: '2px solid black',
        pb: 0.5,
        mb: 2,
        fontWeight: 'bold',
      }}
    >
      {title}
    </Typography>
  );

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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="div" sx={{ mb: 2 }}>
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

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              {renderContactIcon(
                <EmailIcon fontSize="small" />,
                resumeData.contact.email,
                (value) => updateContact({ ...resumeData.contact, email: value })
              )}
              {renderContactIcon(
                <PhoneIcon fontSize="small" />,
                resumeData.contact.phone,
                (value) => updateContact({ ...resumeData.contact, phone: value })
              )}
              {renderContactIcon(
                <LinkedInIcon fontSize="small" />,
                resumeData.contact.linkedin,
                (value) => updateContact({ ...resumeData.contact, linkedin: value })
              )}
              {renderContactIcon(
                <LanguageIcon fontSize="small" />,
                resumeData.contact.website,
                (value) => updateContact({ ...resumeData.contact, website: value })
              )}
            </Box>

            {(resumeData.contact.country && resumeData.contact.showCountry || resumeData.contact.state && resumeData.contact.showState) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                <LocationOnIcon fontSize="small" />
                <EditableSpan
                  content={`${resumeData.contact.showCountry ? resumeData.contact.country : ''}${resumeData.contact.showCountry && resumeData.contact.showState && resumeData.contact.country && resumeData.contact.state ? ', ' : ''}${resumeData.contact.showState ? resumeData.contact.state : ''}`}
                  onUpdate={(value) => {
                    const [country, state] = value.split(',').map(s => s.trim());
                    updateContact({ ...resumeData.contact, country, state });
                  }}
                  style={getContentStyle()}
                />
              </Box>
            )}
          </Box>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(section => section.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSection key={section.id} id={section.id}>
                  <Box sx={{ mb: 3 }}>
                    {section.id === 'summary' && resumeData.summary && (
                      <>
                        {renderSectionTitle(section.title)}
                        <EditableSpan
                          content={resumeData.summary}
                          onUpdate={updateSummary}
                          style={getContentStyle()}
                          allowFormatting
                        />
                      </>
                    )}

                    {section.id === 'experience' && resumeData.experiences.length > 0 && (
                      <>
                        {renderSectionTitle(section.title)}
                        {resumeData.experiences.map((exp, idx) => (
                          <Box key={idx} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="subtitle1" sx={{ ...getContentStyle(), fontWeight: 'bold' }}>
                                {exp.position}
                              </Typography>
                              <Typography variant="body2" sx={getContentStyle()}>
                                {exp.startDate} - {exp.endDate}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" sx={{ ...getContentStyle(), mb: 1 }}>
                              {exp.company}
                            </Typography>
                            <EditableSpan
                              content={exp.description}
                              onUpdate={(value) => {
                                const newExperiences = [...resumeData.experiences];
                                newExperiences[idx] = { ...exp, description: value };
                                updateExperiences(newExperiences);
                              }}
                              style={getContentStyle()}
                              allowFormatting
                            />
                          </Box>
                        ))}
                      </>
                    )}

                    {section.id === 'education' && resumeData.education.length > 0 && (
                      <>
                        {renderSectionTitle(section.title)}
                        {resumeData.education.map((edu, idx) => (
                          <Box key={idx} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="subtitle1" sx={{ ...getContentStyle(), fontWeight: 'bold' }}>
                                {edu.school}
                              </Typography>
                              <Typography variant="body2" sx={getContentStyle()}>
                                {edu.startDate} - {edu.endDate}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" sx={getContentStyle()}>
                              {edu.degree} • {edu.field}
                            </Typography>
                            <EditableSpan
                              content={edu.description || ''}
                              onUpdate={(value) => {
                                const newEducation = [...resumeData.education];
                                newEducation[idx] = { ...edu, description: value };
                                updateEducation(newEducation);
                              }}
                              style={getContentStyle()}
                              allowFormatting
                            />
                          </Box>
                        ))}
                      </>
                    )}

                    {section.id === 'skills' && resumeData.skills.length > 0 && (
                      <>
                        {renderSectionTitle(section.title)}
                        <Typography variant="body1" sx={getContentStyle()}>
                          {resumeData.skills.join(' • ')}
                        </Typography>
                      </>
                    )}

                    {section.id === 'courses' && (
                      <>
                        {renderSectionTitle(section.title)}
                        <Typography variant="body1" sx={getContentStyle()}>
                          JavaScript and Algorithms • Responsive Web Designing • Symfony 5 Fundamentals & Deep Dive
                        </Typography>
                      </>
                    )}
                  </Box>
                </SortableSection>
              ))}
            </SortableContext>
          </DndContext>
        </Paper>
      </Container>
    </Box>
  );
}