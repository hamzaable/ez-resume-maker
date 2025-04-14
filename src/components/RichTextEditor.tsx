import React, { useRef, useState, useEffect } from 'react';
import { Paper, IconButton, Tooltip, Box, Button, Snackbar, Alert } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { generateBulletPoint } from '../services/ai';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  contextData?: {
    position?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    degree?: string;
    field?: string;
    school?: string;
  };
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 100, contextData }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const lastSelection = useRef<Range | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node) &&
          toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelection.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (lastSelection.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelection.current);
      }
    }
  };

  const handleFormat = (command: string, value?: string) => {
    saveSelection();
    document.execCommand(command, false, value);
    restoreSelection();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleFocus = () => {
    setShowToolbar(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setShowToolbar(true);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerHTML === '<br>') {
      e.currentTarget.innerHTML = '';
    }
    onChange(e.currentTarget.innerHTML);
  };

  const handleGenerateBullet = async () => {
    if (!contextData) return;

    setIsGenerating(true);
    setError(null);
    try {
      let prompt = '';

      if (contextData.position && contextData.company) {
        prompt = `As a ${contextData.position} at ${contextData.company}`;
        if (contextData.startDate && contextData.endDate) {
          prompt += ` from ${contextData.startDate} to ${contextData.endDate}`;
        }
      } else if (contextData.degree && contextData.field && contextData.school) {
        prompt = `While studying ${contextData.degree} in ${contextData.field} at ${contextData.school}`;
        if (contextData.startDate && contextData.endDate) {
          prompt += ` from ${contextData.startDate} to ${contextData.endDate}`;
        }
      }

      const bullet = await generateBulletPoint(prompt);

      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML;
        editorRef.current.innerHTML = currentContent + (currentContent ? '<br>' : '') + bullet;
        onChange(editorRef.current.innerHTML);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate bullet point');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {showToolbar && (
        <Paper
          ref={toolbarRef}
          sx={{
            display: 'flex',
            p: 0.5,
            mb: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.paper',
            gap: 0.5
          }}
        >
          <Tooltip title="Bold">
            <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')}>
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')}>
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('underline')}>
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton
              size="small"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) handleFormat('createLink', url);
              }}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormat('insertUnorderedList')}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormat('insertOrderedList')}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {contextData && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={isGenerating}
              onClick={handleGenerateBullet}
              startIcon={<AutoAwesomeIcon />}
              sx={{ ml: 'auto' }}
            >
              {isGenerating ? 'Generating...' : 'Generate Bullet'}
            </Button>
          )}
        </Paper>
      )}
      <div
        ref={editorRef}
        contentEditable
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        onPaste={handlePaste}
        onInput={handleInput}
        data-placeholder={placeholder}
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
      />
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}