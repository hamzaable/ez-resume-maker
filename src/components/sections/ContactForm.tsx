import { useState } from 'react';
import {
  TextField,
  Grid,
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useResume } from '../../context/ResumeContext';

export default function ContactForm() {
  const { resumeData, updateContact } = useResume();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateContact({
      ...resumeData.contact,
      [name]: value
    });
  };

  const handleVisibilityChange = (field: 'showState' | 'showCountry', value: boolean) => {
    updateContact({
      ...resumeData.contact,
      [field]: value
    });
  };

  return (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={resumeData.contact.fullName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={resumeData.contact.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={resumeData.contact.phone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="LinkedIn URL"
            name="linkedin"
            value={resumeData.contact.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Personal Website"
            name="website"
            value={resumeData.contact.website}
            onChange={handleChange}
            placeholder="your-website.com"
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body1">Country</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={resumeData.contact.showCountry}
                  onChange={(e) => handleVisibilityChange('showCountry', e.target.checked)}
                />
              }
              label="Show on resume"
            />
          </Box>
          <TextField
            fullWidth
            name="country"
            value={resumeData.contact.country}
            onChange={handleChange}
            placeholder="Select your country"
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body1">State</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={resumeData.contact.showState}
                  onChange={(e) => handleVisibilityChange('showState', e.target.checked)}
                />
              }
              label="Show on resume"
            />
          </Box>
          <TextField
            fullWidth
            name="state"
            value={resumeData.contact.state}
            onChange={handleChange}
            placeholder="Select your state"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              // Save is automatic with context
            }}
          >
            Save Basic Info
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}