import { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useResume } from '../../context/ResumeContext';

interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

const emptyExperience: ExperienceEntry = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
};

export default function ExperienceForm() {
  const { resumeData, updateExperiences } = useResume();
  const [currentExperience, setCurrentExperience] = useState<ExperienceEntry>(emptyExperience);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentExperience(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    if (currentExperience.company && currentExperience.position) {
      updateExperiences([...resumeData.experiences, currentExperience]);
      setCurrentExperience(emptyExperience);
    }
  };

  const handleDelete = (index: number) => {
    const newExperiences = resumeData.experiences.filter((_, i) => i !== index);
    updateExperiences(newExperiences);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Experience
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Company"
            name="company"
            value={currentExperience.company}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Position"
            name="position"
            value={currentExperience.position}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="month"
            value={currentExperience.startDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="month"
            value={currentExperience.endDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={currentExperience.description}
            onChange={handleChange}
            placeholder="• Use bullet points to describe your achievements&#10;• Focus on impact and quantifiable results&#10;• Use action verbs"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
            disabled={!currentExperience.company || !currentExperience.position}
          >
            Add Experience
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Experience Entries
        </Typography>
        {resumeData.experiences.map((experience, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">
                    {experience.position} at {experience.company}
                  </Typography>
                  <Typography color="textSecondary">
                    {experience.startDate} - {experience.endDate}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {experience.description}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleDelete(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}