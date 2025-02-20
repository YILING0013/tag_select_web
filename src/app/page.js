//page.js
"use client";

import * as React from 'react';
import { useState } from 'react';
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
  const [tags, setTags] = useState([]);

  // 新增标签（点击 Chip 时调用）
  const handleAddTag = (newTag) => {
    setTags(prevTags => [
      ...prevTags,
      { ...newTag, id: Date.now().toString() + Math.random().toString() }
    ]);
  };

  // 更新标签（加减按钮改变嵌套层数时调用）
  const handleUpdateTag = (updatedTag) => {
    setTags(prevTags =>
      prevTags.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
    );
  };

  // 删除标签
  const handleDeleteTag = (tagId) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  // 拖拽排序后接收新标签数组
  const handleReorderTags = (newList) => {
    setTags(newList);
  };

  // 清空所有标签
  const handleClearTags = () => {
    setTags([]);
  };
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
      <Grid container spacing={0.5} >
        <Grid size={{ xs: 12, md: 12 }}>
        <OutputSection
          tags={tags}
          onUpdateTag={handleUpdateTag}
          onDeleteTag={handleDeleteTag}
          onReorderTags={handleReorderTags}
          onClearTags={handleClearTags}
        />
        </Grid>
      </Grid>

      {/* 第二行：主内容区域 */}
      <Grid container spacing={0.5} sx={{ flex: 1, minHeight: 0 }}>
        {/* 左侧分类标签页 */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
          <CategoryTabs onAddTag={handleAddTag} />
        </Grid>

        {/* 右侧侧边栏 */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
          <Sidebar onAddTag={handleAddTag}/>
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