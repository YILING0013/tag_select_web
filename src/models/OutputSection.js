import * as React from 'react';
import { Container, Card, CardContent, TextField, Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ReactSortable } from 'react-sortablejs';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

// 单个标签组件
const TagItem = ({ tag, onUpdateTag, onDeleteTag, useRoundWeightSymbol }) => {
  const computeEnText = () => {
    if (tag.curlyCount > 0) {
      const leftSymbol = useRoundWeightSymbol ? '(' : '{';
      const rightSymbol = useRoundWeightSymbol ? ')' : '}';
      return leftSymbol.repeat(tag.curlyCount) + tag.originalEnText + rightSymbol.repeat(tag.curlyCount);
    } else if (tag.squareCount > 0) {
      return '['.repeat(tag.squareCount) + tag.originalEnText + ']'.repeat(tag.squareCount);
    } else {
      return tag.originalEnText;
    }
  };

  const handlePlus = () => {
    if (tag.squareCount > 0) {
      onUpdateTag({ ...tag, squareCount: tag.squareCount - 1 });
    } else {
      onUpdateTag({ ...tag, curlyCount: tag.curlyCount + 1 });
    }
  };

  const handleMinus = () => {
    if (tag.curlyCount > 0) {
      onUpdateTag({ ...tag, curlyCount: tag.curlyCount - 1 });
    } else {
      onUpdateTag({ ...tag, squareCount: tag.squareCount + 1 });
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: 1,
        p: 0.5,
        m: 0.2,
        backgroundColor: '#f9f9f9',
        cursor: 'move',
      }}
      data-id={tag.id}
    >
      <IconButton size="small" sx={{ p: 0.2 }} onClick={handlePlus}>
        <AddIcon fontSize="inherit" />
      </IconButton>
      <IconButton size="small" sx={{ p: 0.2 }} onClick={handleMinus}>
        <RemoveIcon fontSize="inherit" />
      </IconButton>
      <Typography variant="body2" sx={{ mx: 0.2 }}>
        {tag.cnText}
      </Typography>
      <Typography variant="body2" sx={{ mx: 0.5 }}>
        {computeEnText()}
      </Typography>
      <IconButton size="small" sx={{ p: 0.2 }} onClick={() => onDeleteTag(tag.id)}>
        <DeleteIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

export const OutputSection = (props) => {
  const { tags, onUpdateTag, onDeleteTag, onReorderTags, onClearTags } = props;
  const [useRoundWeightSymbol, setUseRoundWeightSymbol] = React.useState(false);

  const getOutputText = () => {
    return tags
      .map(tag => {
        if (tag.curlyCount > 0) {
          const leftSymbol = useRoundWeightSymbol ? '(' : '{';
          const rightSymbol = useRoundWeightSymbol ? ')' : '}';
          return leftSymbol.repeat(tag.curlyCount) + tag.originalEnText + rightSymbol.repeat(tag.curlyCount);
        } else if (tag.squareCount > 0) {
          return '['.repeat(tag.squareCount) + tag.originalEnText + ']'.repeat(tag.squareCount);
        } else {
          return tag.originalEnText;
        }
      })
      .join(', ');
  };

  const handleCopy = () => {
    const text = getOutputText();

    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('已复制到剪贴板！');
        } else {
          alert('复制失败');
        }
      } catch (err) {
        alert('复制失败');
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('已复制到剪贴板！');
        })
        .catch(() => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  const handleToggleWeightSymbol = () => {
    setUseRoundWeightSymbol(prev => !prev);
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Grid container spacing={0.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', minHeight: 250, flexDirection: 'column' }}>
              <Box
                sx={{
                  flex: 1,
                  p: 1,
                  border: '1px dashed grey',
                  borderRadius: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                <ReactSortable
                  list={tags}
                  setList={onReorderTags}
                  tag="div"
                  options={{ animation: 150 }}
                >
                  {tags.map((tag) => (
                    <TagItem 
                      key={tag.id} 
                      tag={tag} 
                      onUpdateTag={onUpdateTag} 
                      onDeleteTag={onDeleteTag}
                      useRoundWeightSymbol={useRoundWeightSymbol}
                    />
                  ))}
                </ReactSortable>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                multiline
                minRows={5}
                maxRows={5}
                placeholder="这里是调整后的词条输出"
                value={getOutputText()}
                aria-readonly="true"
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button variant="contained" color="primary" fullWidth onClick={handleCopy}>
                  复制 Copy
                </Button>
                <Button variant="contained" color="error" fullWidth onClick={onClearTags}>
                  清空 Clear
                </Button>
                <Button variant="contained" color="info" fullWidth onClick={handleToggleWeightSymbol}>
                  切换加权符号
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OutputSection;