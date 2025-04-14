import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  SelectChangeEvent,
} from '@mui/material';

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
}: DocumentControlsProps) {
  const handleFontChange = (event: SelectChangeEvent) => {
    onFontChange(event.target.value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent) => {
    onPageSizeChange(event.target.value);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Page Size</InputLabel>
        <Select
          value={pageSize}
          label="Page Size"
          onChange={handlePageSizeChange}
          size="small"
        >
          {pageSizes.map((size) => (
            <MenuItem key={size.value} value={size.value}>
              {size.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Font</InputLabel>
        <Select
          value={font}
          label="Font"
          onChange={handleFontChange}
          size="small"
        >
          {fonts.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ minWidth: 120 }}>
        <Typography gutterBottom variant="caption">
          Font Size: {fontSize}
        </Typography>
        <Slider
          value={fontSize}
          min={8}
          max={16}
          step={0.5}
          onChange={(_, value) => onFontSizeChange(value as number)}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      <Box sx={{ minWidth: 120 }}>
        <Typography gutterBottom variant="caption">
          Line Spacing: {lineSpacing}
        </Typography>
        <Slider
          value={lineSpacing}
          min={1}
          max={2}
          step={0.1}
          onChange={(_, value) => onLineSpacingChange(value as number)}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>

      <Box sx={{ minWidth: 120 }}>
        <Typography gutterBottom variant="caption">
          Margins: {margins}mm
        </Typography>
        <Slider
          value={margins}
          min={10}
          max={30}
          step={1}
          onChange={(_, value) => onMarginsChange(value as number)}
          valueLabelDisplay="auto"
          size="small"
        />
      </Box>
    </Box>
  );
}