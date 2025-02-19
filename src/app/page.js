"use client";

import * as React from 'react';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { CategoryTabs } from '../models/CategoryTabs';
import { Sidebar } from '../models/Sidebar';
import { OutputSection } from '../models/OutputSection';

function App() {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {/* 第一行：Tag 选择 + 输出区域 */}
      <Grid container spacing={0.5}>
        <Grid size={{ xs: 12, md: 12 }}>
          <OutputSection />
        </Grid>
      </Grid>

      {/* 第二行：主内容区域 */}
      <Grid container spacing={0.5} sx={{ flex: 1, minHeight: 0 }}>
        {/* 左侧分类标签页 */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <CategoryTabs />
        </Grid>

        {/* 右侧侧边栏 */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
          <Sidebar />
        </Grid>
      </Grid>
    </Container>
  );
}

export default function Home() {
  return (
    <div style={{ height: '100vh' }}>
      <App />
    </div>
  );
}