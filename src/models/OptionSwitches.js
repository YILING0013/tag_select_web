import * as React from 'react';
import { Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';

export const OptionSwitches = () => (
  <Card sx={{ flex: '0 0 auto' }}>
    <CardContent>
      <Grid container spacing={0.5}>
        {['English', '中文', '减权-', '加权+', '删除X', '加权符号切换', 'R18'].map((label) => (
          <Grid key={label}>
            <FormControlLabel control={<Switch />} label={label} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);
