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
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onLineSpacingChange: (spacing: number) => void;
  onMarginsChange: (margins: number) => void;
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

export default function DocumentControls({
  font,
  fontSize,
  lineSpacing,
  margins,
  onFontChange,
  onFontSizeChange,
  onLineSpacingChange,
  onMarginsChange,
}: DocumentControlsProps) {
  const handleFontChange = (event: SelectChangeEvent) => {
    onFontChange(event.target.value);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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