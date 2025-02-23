// Sidebar.js
import * as React from 'react';
import { 
  Card, CardContent, Tabs, Tab, Box, Typography, TextField, Button,
} from '@mui/material';

import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FavoriteIcon from '@mui/icons-material/Favorite';

export const Sidebar = (props) => {
  const { onAddTag } = props;
  const [sidebarTab, setSidebarTab] = React.useState(3);

  // 自定义模块状态
  const [customInput, setCustomInput] = React.useState('');
  const [customTags, setCustomTags] = React.useState([]);

  // D站Tag导入状态
  const [dsiteInput, setDsiteInput] = React.useState('');
  const [dsiteTags, setDsiteTags] = React.useState([]);

  // Tag搜索状态
  const [searchInput, setSearchInput] = React.useState('');
  const [maxResults, setMaxResults] = React.useState('');
  const [searchTags, setSearchTags] = React.useState([]);

  const handleSidebarTabChange = (event, newValue) => {
    setSidebarTab(newValue);
  };

  // 统一标签容器的样式
  const tagContainerStyle = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    bgcolor: 'background.paper'
  };

  // 统一标签按钮的样式
  const tagButtonStyle = {
    m: 0.5,
    textTransform: 'none',
    fontSize: '0.75rem',
    py: 0.25,
    px: 1,
    color: 'text.secondary',
    borderWidth: 1,
    '&:hover': {
      borderWidth: 1
    }
  };

  // ---------- 自定义模块逻辑 ----------
  const handleLoadCustomTags = async () => {
    if (!customInput.trim()) return;
    const texts = customInput.split(',').map(s => s.trim()).filter(s => s);
    try {
      const response = await fetch('/api/Tagtranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });
      if (!response.ok) throw new Error('Translation API error');
      const data = await response.json();
      const translatedTexts = data.translated_texts;
      const newTags = texts.map((text, index) => ({
        originalEnText: text,
        cnText: (translatedTexts && translatedTexts[index]) ? translatedTexts[index] : text,
        curlyCount: 0,
        squareCount: 0
      }));
      setCustomTags(prev => [...prev, ...newTags]);
    } catch (error) {
      const newTags = texts.map(text => ({
        originalEnText: text,
        cnText: text,
        curlyCount: 0,
        squareCount: 0
      }));
      setCustomTags(prev => [...prev, ...newTags]);
    }
  };

  const handleClearCustomTags = () => {
    setCustomTags([]);
  };

  // ---------- D站Tag导入逻辑 ----------
  const handleLoadDsiteTags = async () => {
    if (!dsiteInput.trim()) return;
    try {
      const url = `/api/extract_tags?url=${encodeURIComponent(dsiteInput)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('D站Tag API error');
      const data = await response.json();
      const newTags = data.map(item => ({
        originalEnText: item.tag_name,
        cnText: item.translated_tag_name || item.tag_name,
        curlyCount: 0,
        squareCount: 0
      }));
      setDsiteTags(prev => [...prev, ...newTags]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearDsiteTags = () => {
    setDsiteTags([]);
  };

  // ---------- Tag搜索逻辑 ----------
  const buildSearchUrl = (type) => {
    let url = `/search/${type}?query=${encodeURIComponent(searchInput)}`;
    if (maxResults.trim()) {
      url += `&max_results=${encodeURIComponent(maxResults)}`;
    }
    return url;
  };

  const handleSearch = async (type) => {
    if (!searchInput.trim()) return;
    try {
      const url = buildSearchUrl(type);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${type} search error`);
      const data = await response.json();
      const newTags = data.map(item => {
        const key = Object.keys(item)[0];
        return {
          originalEnText: key,
          cnText: item[key] || key,
          curlyCount: 0,
          squareCount: 0
        };
      });
      setSearchTags(prev => [...prev, ...newTags]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegexSearch = () => handleSearch('regular_expression');
  const handleFuzzySearch = () => handleSearch('fuzzy_search');
  const handleExactSearch = () => handleSearch('exact_search');
  const handleClearSearchTags = () => setSearchTags([]);

  // ---------- 渲染各个模块 ----------
  const getSidebarTabContent = (index) => {
    switch (index) {
      case 0: // 自定义选项卡
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* 输入行 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder="请在此输入你的tag串, tag将按照逗号划分开并添加为页面元素"
                  variant="outlined"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start',
                      overflow: 'auto'
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" onClick={handleLoadCustomTags} size="small">
                  加载
                </Button>
                <Button variant="outlined" color="error" onClick={handleClearCustomTags} size="small">
                  清空
                </Button>
              </Box>
            </Box>
            {/* 标签容器 */}
            <Box sx={tagContainerStyle}>
              {customTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                  sx={tagButtonStyle}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 1: // D站Tag导入选项卡
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* 输入行 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={4}
                placeholder="D站图像网址示例：https://danbooru.donmai.us/posts/114514"
                variant="outlined"
                value={dsiteInput}
                onChange={(e) => setDsiteInput(e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    alignItems: 'flex-start',
                    overflow: 'auto'
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" onClick={handleLoadDsiteTags} size="small">
                  解析
                </Button>
                <Button variant="outlined" color="error" onClick={handleClearDsiteTags} size="small">
                  清空
                </Button>
              </Box>
            </Box>
            {/* 标签容器 */}
            <Box sx={tagContainerStyle}>
              {dsiteTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                  sx={tagButtonStyle}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 2: // Tag搜索选项卡
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            {/* 搜索条件行 */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="搜索内容（中英文皆可）"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <TextField
                placeholder="返回量"
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
                sx={{ width: 100 }}
              />
            </Box>
            {/* 按钮组 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleRegexSearch} size="small">
                正则
              </Button>
              <Button variant="contained" onClick={handleFuzzySearch} size="small">
                模糊
              </Button>
              <Button variant="contained" onClick={handleExactSearch} size="small">
                精确
              </Button>
              <Button variant="outlined" color="error" onClick={handleClearSearchTags} size="small">
                清空
              </Button>
            </Box>
            {/* 标签容器 */}
            <Box sx={tagContainerStyle}>
              {searchTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                  sx={tagButtonStyle}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 3: // 关于选项卡
      default:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 3, overflow: 'auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
              关于我们
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>网站信息</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    本平台是<b>Xianyun Draw Web</b>生态的组成部分，提供专业的词条管理服务。
                    所有服务均免费提供，遵循{" "}
                    <Link href="https://nai.idlecloud.cc/terms" target="_blank" rel="noopener">用户协议</Link>。
                  </Typography>
                </Card>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>开发相关</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Link href="https://github.com/YILING0013" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
                      <GitHubIcon fontSize="small" /> GitHub 仓库
                    </Link>
                    <Link href="https://nai.idlecloud.cc" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
                      <OpenInNewIcon fontSize="small" /> 绘图主站
                    </Link>
                  </Box>
                </Card>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>社区互动</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" startIcon={<GroupIcon />} href="https://qm.qq.com/cgi-bin/qm/qr?k=GmMDP5LFpfQiHZ56AtUhAfOuyUKKS3CC" target="_blank" sx={{ justifyContent: 'flex-start' }}>
                      加入QQ群
                    </Button>
                    <Button variant="outlined" startIcon={<VideoLibraryIcon />} href="https://space.bilibili.com/487156342" target="_blank" sx={{ justifyContent: 'flex-start' }}>
                      Bilibili频道
                    </Button>
                  </Box>
                </Card>
                <Card variant="outlined" sx={{ p: 2, background: theme => theme.palette.mode === 'light' ? 'linear-gradient(45deg, #ffe9e9 30%, #f6f3ff 90%)' : 'linear-gradient(45deg, #2a2a2a 30%, #1a1a1a 90%)' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>支持我们</Typography>
                    <Box sx={{ width: 80, height: 80, margin: '0 auto 16px', background: 'url(https://afdian.com/static/img/logo/logo.png) center/contain no-repeat' }} />
                    <Button variant="contained" color="secondary" endIcon={<FavoriteIcon />} href="https://afdian.com/a/lingyunfei" target="_blank" sx={{ borderRadius: 20, px: 4, textTransform: 'none', boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                      爱发电赞助
                    </Button>
                  </Box>
                </Card>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
              © {new Date().getFullYear()} Xianyun Project. All rights reserved.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, minHeight: 0 }}>
        <Tabs value={sidebarTab} onChange={handleSidebarTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {['自定义', 'D站Tag导入', 'Tag搜索', '关于'].map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <Box sx={{ flex: 1, p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {getSidebarTabContent(sidebarTab)}
        </Box>
      </CardContent>
    </Card>
  );
};