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
import EditIcon from '@mui/icons-material/Edit';
import { useResume } from '../../context/ResumeContext';
import RichTextEditor from '../RichTextEditor';

interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

const emptyEducation: EducationEntry = {
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  description: '',
};

export default function EducationForm() {
  const { resumeData, updateEducation } = useResume();
  const [currentEducation, setCurrentEducation] = useState<EducationEntry>(emptyEducation);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    if (currentEducation.school && currentEducation.degree) {
      const newEducation = [...resumeData.education];
      if (editingIndex !== null) {
        // Update existing education
        newEducation[editingIndex] = currentEducation;
      } else {
        // Add new education
        newEducation.push(currentEducation);
      }
      updateEducation(newEducation);
      setCurrentEducation(emptyEducation);
      setEditingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    updateEducation(newEducation);
  };

  const handleDescriptionChange = (value: string) => {
    setCurrentEducation(prev => ({
      ...prev,
      description: value
    }));
  };

  const handleEdit = (index: number) => {
    setCurrentEducation(resumeData.education[index]);
    setEditingIndex(index);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {editingIndex !== null ? 'Edit Education' : 'Add Education'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="School/University"
            name="school"
            value={currentEducation.school}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Degree"
            name="degree"
            value={currentEducation.degree}
            onChange={handleChange}
            placeholder="e.g., Bachelor's, Master's"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Field of Study"
            name="field"
            value={currentEducation.field}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="month"
            value={currentEducation.startDate}
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
            value={currentEducation.endDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5, color: 'text.secondary' }}>
            Description
          </Typography>
          <RichTextEditor
            value={currentEducation.description || ''}
            onChange={handleDescriptionChange}
            placeholder="• Describe your academic achievements&#10;• List relevant coursework&#10;• Mention honors or awards"
            minHeight={150}
            contextData={{
              degree: currentEducation.degree,
              field: currentEducation.field,
              school: currentEducation.school,
              startDate: currentEducation.startDate,
              endDate: currentEducation.endDate
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAdd}
            disabled={!currentEducation.school || !currentEducation.degree}
          >
            {editingIndex !== null ? 'Update Education' : 'Add Education'}
          </Button>
          {editingIndex !== null && (
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => {
                setCurrentEducation(emptyEducation);
                setEditingIndex(null);
              }}
              sx={{ mt: 1 }}
            >
              Cancel Edit
            </Button>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Education Entries
        </Typography>
        {resumeData.education.map((education, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">
                    {education.degree} in {education.field}
                  </Typography>
                  <Typography variant="subtitle1">
                    {education.school}
                  </Typography>
                  <Typography color="textSecondary">
                    {education.startDate} - {education.endDate}
                  </Typography>
                  {education.description && (
                    <div dangerouslySetInnerHTML={{ __html: education.description }} />
                  )}
                </Box>
                <Box>
                  <IconButton onClick={() => handleEdit(index)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}