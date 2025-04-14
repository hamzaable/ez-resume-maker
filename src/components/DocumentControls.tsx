import {
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    SelectChangeEvent,
    TextField,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface DocumentControlsProps {
    font: string;
    fontSize: number;
    lineSpacing: number;
    margins: number;
    pageSize: string;
    onFontChange: (font: string) => void;
    onFontSizeChange: (size: number) => void;
    onLineSpacingChange: (spacing: number) => void;
    onMarginsChange: (margins: number) => void;
    onPageSizeChange: (size: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const fonts = [
    'MERRIWEATHER',
    'ARIAL',
    'TIMES NEW ROMAN',
    'HELVETICA',
    'CALIBRI',
    'CAMBRIA',
    'GEORGIA',
];

const pageSizes = [
    { value: 'A4', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
    { value: 'LETTER', label: 'Letter (216 × 279 mm)', width: 216, height: 279 },
    { value: 'LEGAL', label: 'Legal (216 × 356 mm)', width: 216, height: 356 },
];

export default function DocumentControls({
    font,
    fontSize,
    lineSpacing,
    margins,
    pageSize,
    onFontChange,
    onFontSizeChange,
    onLineSpacingChange,
    onMarginsChange,
    onPageSizeChange,
    isOpen,
    onToggle,
}: DocumentControlsProps) {
    const handleFontChange = (event: SelectChangeEvent) => {
        onFontChange(event.target.value);
    };

    const handlePageSizeChange = (event: SelectChangeEvent) => {
        onPageSizeChange(event.target.value);
    };

    return (
        <>
            <Paper
                sx={{
                    width: isOpen ? 280 : 0,
                    height: "100%",
                    p: isOpen ? 2 : 0,
                    overflowY: 'auto',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    transition: 'all 0.3s ease',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-280px)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Settings
                    </Typography>
                    <Tooltip title={isOpen ? "Hide Settings" : "Show Settings"}>
                        <IconButton onClick={onToggle} size="small">
                            {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {isOpen && (
                    <>
                        <FormControl fullWidth size="small">
                            <InputLabel>Page Size</InputLabel>
                            <Select
                                value={pageSize}
                                label="Page Size"
                                onChange={handlePageSizeChange}
                            >
                                {pageSizes.map((size) => (
                                    <MenuItem key={size.value} value={size.value}>
                                        {size.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Font</InputLabel>
                            <Select
                                value={font}
                                label="Font"
                                onChange={handleFontChange}
                            >
                                {fonts.map((f) => (
                                    <MenuItem key={f} value={f}>
                                        {f}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Font Size"
                            type="number"
                            value={fontSize}
                            onChange={(e) => onFontSizeChange(Number(e.target.value))}
                            inputProps={{ min: 8, max: 16, step: 0.5 }}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Line Spacing"
                            type="number"
                            value={lineSpacing}
                            onChange={(e) => onLineSpacingChange(Number(e.target.value))}
                            inputProps={{ min: 1, max: 2, step: 0.1 }}
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Margins (mm)"
                            type="number"
                            value={margins}
                            onChange={(e) => onMarginsChange(Number(e.target.value))}
                            inputProps={{ min: 10, max: 30, step: 1 }}
                            size="small"
                            fullWidth
                        />
                    </>
                )}
            </Paper>
            {!isOpen && (
                <Tooltip title="Show Settings">
                    <IconButton
                        onClick={onToggle}
                        size="small"
                        sx={{
                            position: 'fixed',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1000,
                            backgroundColor: 'background.paper',
                            borderRadius: '0 4px 4px 0',
                            boxShadow: 1,
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </Tooltip>
            )}
        </>
    );
}