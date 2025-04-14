import { useState } from 'react';
import {
  TextField,
  Grid,
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useResume } from '../../context/ResumeContext';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableChipProps {
  id: string;
  skill: string;
  index: number;
  onDelete: () => void;
}

function SortableChip({ id, skill, onDelete }: SortableChipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    margin: '4px',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        {...attributes}
        {...listeners}
        sx={{
          mr: 0.5,
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          '&:hover': { opacity: 0.8 }
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Chip
        label={skill}
        onDelete={onDelete}
        color="primary"
        variant="outlined"
      />
    </Box>
  );
}

export default function SkillsForm() {
  const { resumeData, updateSkills } = useResume();
  const [currentSkill, setCurrentSkill] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAdd = () => {
    if (currentSkill.trim()) {
      updateSkills([...resumeData.skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleDelete = (index: number) => {
    const newSkills = resumeData.skills.filter((_, i) => i !== index);
    updateSkills(newSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      handleAdd();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resumeData.skills.findIndex(
        (skill) => `skill-${skill}` === active.id
      );
      const newIndex = resumeData.skills.findIndex(
        (skill) => `skill-${skill}` === over.id
      );

      updateSkills(arrayMove(resumeData.skills, oldIndex, newIndex));
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Skills
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Skill"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a skill and press Enter"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Skills List (Drag to reorder)
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px dashed rgba(0, 0, 0, 0.12)',
              borderRadius: 1,
              minHeight: 50,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <SortableContext
              items={resumeData.skills.map(skill => `skill-${skill}`)}
              strategy={horizontalListSortingStrategy}
            >
              {resumeData.skills.map((skill, index) => (
                <SortableChip
                  key={`skill-${skill}`}
                  id={`skill-${skill}`}
                  skill={skill}
                  index={index}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </SortableContext>
          </Paper>
        </DndContext>
      </Box>
    </Box>
  );
}