import * as React from 'react';
import { Container,Card, CardContent, TextField, Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

export const OutputSection = () => (
  <Container
  maxWidth={false}
  disableGutters
>
  {/* Tag 选择 + 输出区域 */}
  <Grid container spacing={0.5}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              flex: 1,
              p: 1,
              border: '1px dashed grey',
              borderRadius: 1,
              overflow: 'auto',
              minHeight: 150,
            }}
          >
            <Typography variant="body2" color="textSecondary">
              [Tag 元素将显示在此处]
            </Typography>
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
            minRows={4}
            placeholder="这里是调整后的词条输出"
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="contained" color="primary" fullWidth>
              复制 Copy
            </Button>
            <Button variant="contained" color="error" fullWidth>
              清空 Clear
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Container>
);
