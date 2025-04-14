import React from 'react';
import { Paper, IconButton, Tooltip, Popover } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';

interface FormatToolbarProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onFormat: (command: string, value?: string) => void;
}

export default function FormatToolbar({ anchorEl, onClose, onFormat }: FormatToolbarProps) {
  const open = Boolean(anchorEl);

  const handleLinkClick = () => {
    const url = prompt('Enter URL:');
    if (url) {
      onFormat('createLink', url);
    }
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <Paper sx={{ display: 'flex', p: 0.5 }}>
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => { onFormat('bold'); onClose(); }}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => { onFormat('italic'); onClose(); }}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton size="small" onClick={() => { onFormat('underline'); onClose(); }}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Link">
          <IconButton size="small" onClick={handleLinkClick}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    </Popover>
  );
}