import React, { useRef, useState } from 'react';
import { Paper, IconButton, Tooltip, Box } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 100 }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleBlur = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setShowToolbar(false);
  };

  const handleFocus = () => {
    setShowToolbar(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {showToolbar && (
        <Paper
          sx={{
            display: 'flex',
            p: 0.5,
            mb: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.paper'
          }}
        >
          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => handleFormat('bold')}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => handleFormat('italic')}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => handleFormat('underline')}>
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton
              size="small"
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) handleFormat('createLink', url);
              }}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={() => handleFormat('insertUnorderedList')}>
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={() => handleFormat('insertOrderedList')}>
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      )}
      <div
        ref={editorRef}
        contentEditable
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight,
          padding: '8px 12px',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          cursor: 'text',
          outline: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
        onInput={(e) => {
          if (e.currentTarget.innerHTML === '<br>') {
            e.currentTarget.innerHTML = '';
          }
        }}
      />
    </Box>
  );
}