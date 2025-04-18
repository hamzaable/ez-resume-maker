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
import { ResumeData } from '../context/ResumeContext';
import DocumentControls from './DocumentControls';
import { KeyboardEvent, useRef, useState, useEffect } from 'react';
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

const pageSizes = {
    A4: { width: 210, height: 297 },
    LETTER: { width: 216, height: 279 },
    LEGAL: { width: 216, height: 356 },
};

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
        updateEducation,
        setResumeData
    } = useResume();
    const { documentStyle } = resumeData;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(true);
    const [showPageNumbers, setShowPageNumbers] = useState(false);
    const [showNameOnPage2, setShowNameOnPage2] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const [needsSecondPage, setNeedsSecondPage] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [splitIndex, setSplitIndex] = useState<number | null>(null);

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
        const page1 = document.getElementById('resume-preview-page1');
        const page2 = document.getElementById('resume-preview-page2');
        if (!page1) return;

        const pageSize = pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4;
        const opt = {
            margin: documentStyle.margins / 10, // Convert mm to cm
            filename: 'resume.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
            },
            jsPDF: {
                unit: 'mm',
                format: documentStyle.pageSize?.toLowerCase() || 'a4',
                orientation: 'portrait',
            },
        };

        if (page2) {
            // Create a container for both pages
            const container = document.createElement('div');
            container.appendChild(page1.cloneNode(true));
            container.appendChild(page2.cloneNode(true));

            // Generate PDF from both pages
            html2pdf().set(opt).from(container).save();
        } else {
            // Generate PDF from single page
            html2pdf().set(opt).from(page1).save();
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

    const updateCvName = (newName: string) => {
        setResumeData((prev: ResumeData) => ({ ...prev, cvName: newName }));
    };

    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            setContentHeight(height);
            const pageHeight = (pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4).height * 3.78; // Convert mm to px
            const availableHeight = pageHeight - (documentStyle.margins * 2 * 3.78); // Account for margins
            console.log(height, availableHeight);
            if (height > availableHeight) {
                // Find the section that would fit best on the first page
                const sections = contentRef.current.querySelectorAll('.resume-section');
                let currentHeight = 0;
                let splitAt = 0;

                // Add some padding to ensure no overflow
                const safeHeight = availableHeight * 0.76; // Use 90% of available height to be safe

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i] as HTMLElement;
                    const sectionHeight = section.offsetHeight;

                    // Check if adding this section would exceed the safe height
                    if (currentHeight + sectionHeight > safeHeight) {
                        // If this is the first section, we have to split it
                        if (i === 0) {
                            splitAt = 0;
                        } else {
                            // Otherwise, split at the previous section
                            splitAt = i - 1;
                        }
                        break;
                    }

                    currentHeight += sectionHeight;

                    // If we've gone through all sections and they fit, no split needed
                    if (i === sections.length - 1) {
                        splitAt = sections.length;
                    }
                }

                setSplitIndex(splitAt);
                setNeedsSecondPage(true);
            } else {
                setSplitIndex(null);
                setNeedsSecondPage(false);
            }
        }
    }, [documentStyle.pageSize, documentStyle.margins, resumeData]);

    const renderSection = (section: Section, isFirstPage: boolean = true) => {
        const shouldRender = isFirstPage ?
            sections.indexOf(section) <= (splitIndex || sections.length) :
            sections.indexOf(section) > (splitIndex || -1);

        if (!shouldRender) return null;

        return (
            <SortableSection key={section.id} id={section.id}>
                <Box sx={{ mb: 3 }} className="resume-section">
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
        );
    };

    const renderPageHeader = (pageNumber: number) => (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
            {(pageNumber === 1 || showNameOnPage2) && (
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
            )}
            {showPageNumbers && pageNumber > 1 && (
                <Typography variant="h6" sx={{ ...getContentStyle(), fontWeight: 'bold' }}>
                    Page {pageNumber}
                </Typography>
            )}
        </Box>
    );

    return (
        <Box>
            <AppBar position="static" color="transparent">
                <Toolbar>
                    <div className='flex justify-between items-center w-full'>
                        <div>
                            <EditableSpan
                                content={resumeData.cvName || 'Untitled'}
                                onUpdate={updateCvName}
                                style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                            />
                        </div>
                        <div>
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
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <Box sx={{ width: isSettingsOpen ? 280 : 0, flexShrink: 0, transition: 'width 0.3s ease' }}>
                    <DocumentControls
                        font={documentStyle.font}
                        fontSize={documentStyle.fontSize}
                        lineSpacing={documentStyle.lineSpacing}
                        margins={documentStyle.margins}
                        pageSize={documentStyle.pageSize}
                        showPageNumbers={showPageNumbers}
                        showNameOnPage2={showNameOnPage2}
                        hasMultiplePages={needsSecondPage}
                        onFontChange={(font) => updateDocumentStyle({ font })}
                        onFontSizeChange={(fontSize) => updateDocumentStyle({ fontSize })}
                        onLineSpacingChange={(lineSpacing) => updateDocumentStyle({ lineSpacing })}
                        onMarginsChange={(margins) => updateDocumentStyle({ margins })}
                        onPageSizeChange={(pageSize) => updateDocumentStyle({ pageSize })}
                        onShowPageNumbersChange={setShowPageNumbers}
                        onShowNameOnPage2Change={setShowNameOnPage2}
                        isOpen={isSettingsOpen}
                        onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
                    />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Paper
                                id="resume-preview-page1"
                                sx={{
                                    width: `${(pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4).width}mm`,
                                    height: `${(pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4).height}mm`,
                                    margin: '0 auto',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    position: 'relative',
                                    ...getContentStyle(),
                                }}
                            >
                                <Box
                                    ref={contentRef}
                                    sx={{
                                        position: 'absolute',
                                        top: `${documentStyle.margins}mm`,
                                        left: `${documentStyle.margins}mm`,
                                        right: `${documentStyle.margins}mm`,
                                        bottom: `${documentStyle.margins}mm`,
                                        overflow: 'auto',
                                    }}
                                >
                                    {renderPageHeader(1)}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', marginBottom: '24px' }}>
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

                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={sections.map(section => section.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {sections.map(section => renderSection(section, true))}
                                        </SortableContext>
                                    </DndContext>
                                </Box>
                            </Paper>
                            {needsSecondPage && (
                                <Paper
                                    id="resume-preview-page2"
                                    sx={{
                                        width: `${(pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4).width}mm`,
                                        height: `${(pageSizes[documentStyle.pageSize as keyof typeof pageSizes] || pageSizes.A4).height}mm`,
                                        margin: '0 auto',
                                        backgroundColor: 'white',
                                        color: 'black',
                                        position: 'relative',
                                        ...getContentStyle(),
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: `${documentStyle.margins}mm`,
                                            left: `${documentStyle.margins}mm`,
                                            right: `${documentStyle.margins}mm`,
                                            bottom: `${documentStyle.margins}mm`,
                                            overflow: 'auto',
                                        }}
                                    >
                                        {renderPageHeader(2)}
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={sections.map(section => section.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {sections.map(section => renderSection(section, false))}
                                            </SortableContext>
                                        </DndContext>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}