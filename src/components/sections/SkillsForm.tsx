import { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import { useResume } from '../../context/ResumeContext';

export default function SkillsForm() {
  const { resumeData, updateSkills } = useResume();
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAddSkill = () => {
    if (currentSkill.trim() && !resumeData.skills.includes(currentSkill.trim())) {
      updateSkills([...resumeData.skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    updateSkills(resumeData.skills.filter(skill => skill !== skillToDelete));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Skills
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Add a Skill"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript, React, Node.js"
            helperText="Press Enter or click Add to add a skill"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddSkill}
            disabled={!currentSkill.trim()}
          >
            Add Skill
          </Button>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mt: 4,
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          minHeight: '100px',
        }}
      >
        {resumeData.skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={() => handleDeleteSkill(skill)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Paper>
    </Box>
  );
}