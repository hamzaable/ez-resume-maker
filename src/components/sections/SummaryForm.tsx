import {
  TextField,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useResume } from '../../context/ResumeContext';

export default function SummaryForm() {
  const { resumeData, updateSummary } = useResume();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSummary(e.target.value);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Professional Summary
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        value={resumeData.summary}
        onChange={handleChange}
        placeholder="Write a compelling summary of your professional background and key achievements. This is your chance to make a strong first impression."
        helperText="Aim for 3-5 sentences that highlight your most relevant qualifications and career goals."
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Tips for a great summary:
        </Typography>
        <ul>
          <Typography variant="body2" component="li" color="textSecondary">
            Start with your professional title and years of experience
          </Typography>
          <Typography variant="body2" component="li" color="textSecondary">
            Highlight your most impressive achievements
          </Typography>
          <Typography variant="body2" component="li" color="textSecondary">
            Mention your career goals and what you can bring to a company
          </Typography>
          <Typography variant="body2" component="li" color="textSecondary">
            Keep it concise and focused on your strengths
          </Typography>
        </ul>
      </Box>
    </Box>
  );
}