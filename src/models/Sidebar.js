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

  // ---------- 自定义模块逻辑 ----------
  const handleLoadCustomTags = async () => {
    if (!customInput.trim()) return;
    // 按逗号分割，并去掉前后空格与空串
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
      // 若翻译出错，则直接使用原始内容创建标签
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
    // type 为 'regular_expression', 'fuzzy_search' 或 'exact_search'
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
      // data 为一个数组，每个元素是一个单键对象
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

  const handleRegexSearch = () => {
    handleSearch('regular_expression');
  };

  const handleFuzzySearch = () => {
    handleSearch('fuzzy_search');
  };

  const handleExactSearch = () => {
    handleSearch('exact_search');
  };

  const handleClearSearchTags = () => {
    setSearchTags([]);
  };

  // ---------- 渲染各个模块 ----------
  const getSidebarTabContent = (index) => {
    switch (index) {
      case 0:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              自定义
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="请在此输入你的tag串, tag将按照逗号划分开并添加为页面元素"
              variant="outlined"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleLoadCustomTags}>
                加载 Tag
              </Button>
              <Button variant="contained" color="error" onClick={handleClearCustomTags}>
                清空 Tag
              </Button>
            </Box>
            {/* 标签容器，支持滚动 */}
            <Box
              sx={{
                marginTop: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                flex: 1, // 新增
                minHeight: 0, // 新增（重要！解决flex容器溢出问题）
                overflowY: 'auto',
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
            >
              {customTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              D站Tag导入
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="在此处输入D站某张图像的网址，例如：https://danbooru.donmai.us/posts/114514"
              variant="outlined"
              value={dsiteInput}
              onChange={(e) => setDsiteInput(e.target.value)}
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleLoadDsiteTags}>
                加载 Tag
              </Button>
              <Button variant="contained" color="error" onClick={handleClearDsiteTags}>
                清空 Tag
              </Button>
            </Box>
            {/* 标签容器 */}
            <Box
              sx={{
                marginTop: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                flex: 1, // 新增
                minHeight: 0, // 新增（重要！解决flex容器溢出问题）
                overflowY: 'auto',
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
            >
              {dsiteTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Tag搜索
            </Typography>
            <TextField
              fullWidth
              placeholder="请在此输入你要搜索的内容，中英文皆可"
              variant="outlined"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleRegexSearch}>
                正则搜索
              </Button>
              <Button variant="contained" color="primary" onClick={handleFuzzySearch}>
                模糊搜索
              </Button>
              <Button variant="contained" color="primary" onClick={handleExactSearch}>
                精确搜索
              </Button>
            </Box>
            <TextField
              sx={{ marginTop: 2 }}
              fullWidth
              placeholder="返回量: 无值则全部返回"
              variant="outlined"
              value={maxResults}
              onChange={(e) => setMaxResults(e.target.value)}
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="error" onClick={handleClearSearchTags}>
                清空 Tag
              </Button>
            </Box>
            {/* 标签容器 */}
            <Box
              sx={{
                marginTop: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                flex: 1, // 新增
                minHeight: 0, // 新增（重要！解决flex容器溢出问题）
                overflowY: 'auto',
                p: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
              }}
            >
              {searchTags.map((tag, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => onAddTag && onAddTag(tag)}
                >
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 3:
        default:
          return (
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              overflow: 'auto'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}>
                关于我们
              </Typography>

              {/* 网格布局容器 */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                flexGrow: 1
              }}>
                {/* 左侧信息区块 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                      网站信息
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      本平台是<b>Xianyun Draw Web</b>生态的组成部分，提供专业的词条管理服务。
                      所有服务均免费提供，遵循{" "}
                      <Link href="https://nai.idlecloud.cc/terms" target="_blank" rel="noopener">
                        用户协议
                      </Link>。
                    </Typography>
                  </Card>

                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                      开发相关
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Link href="https://github.com/YILING0013" target="_blank" rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
                        <GitHubIcon fontSize="small" />
                        GitHub 仓库
                      </Link>
                      <Link href="https://nai.idlecloud.cc" target="_blank" rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
                        <OpenInNewIcon fontSize="small" />
                        绘图主站
                      </Link>
                    </Box>
                  </Card>
                </Box>

                {/* 右侧交互区块 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                      社区互动
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<GroupIcon />}
                        href="https://qm.qq.com/cgi-bin/qm/qr?k=GmMDP5LFpfQiHZ56AtUhAfOuyUKKS3CC"
                        target="_blank"
                        sx={{ justifyContent: 'flex-start' }}>
                        加入QQ群
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<VideoLibraryIcon />}
                        href="https://space.bilibili.com/487156342"
                        target="_blank"
                        sx={{ justifyContent: 'flex-start' }}>
                        Bilibili频道
                      </Button>
                    </Box>
                  </Card>

                  <Card variant="outlined" sx={{ 
                    p: 2, 
                    background: theme => theme.palette.mode === 'light' 
                      ? 'linear-gradient(45deg, #ffe9e9 30%, #f6f3ff 90%)' 
                      : 'linear-gradient(45deg, #2a2a2a 30%, #1a1a1a 90%)'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        支持我们
                      </Typography>
                      <Box sx={{ 
                        width: 80, 
                        height: 80,
                        margin: '0 auto 16px',
                        background: 'url(https://afdian.com/static/img/logo/logo.png) center/contain no-repeat'
                      }} />
                      <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<FavoriteIcon />}
                        href="https://afdian.com/a/lingyunfei"
                        target="_blank"
                        sx={{
                          borderRadius: 20,
                          px: 4,
                          textTransform: 'none',
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 3
                          }
                        }}>
                        爱发电赞助
                      </Button>
                    </Box>
                  </Card>
                </Box>
              </Box>

              {/* 页脚信息 */}
              <Typography variant="caption" sx={{ 
                color: 'text.secondary', 
                textAlign: 'center',
                mt: 2
              }}>
                © {new Date().getFullYear()} Xianyun Project. All rights reserved.
              </Typography>
            </Box>
          );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 ,minHeight: 0}}>
        <Tabs
          value={sidebarTab}
          onChange={handleSidebarTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {['自定义', 'D站Tag导入', 'Tag搜索', '关于'].map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflow: 'hidden', // 修改为hidden
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%' // 新增
          }}
        >
          {getSidebarTabContent(sidebarTab)}
        </Box>
      </CardContent>
    </Card>
  );
};
