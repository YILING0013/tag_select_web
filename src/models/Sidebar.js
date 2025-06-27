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
  const [dsiteLoading, setDsiteLoading] = React.useState(false);

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

  // ---------- 前端HTML解析函数 ----------
  const parseHtmlForTags = (htmlString) => {
    // 创建一个临时的DOM解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // 查找所有具有 data-tag-name 属性的元素
    const tagElements = doc.querySelectorAll('[data-tag-name]');
    
    const extractedTags = [];
    tagElements.forEach(element => {
      // 提取标签名，并将下划线替换为空格
      const tagName = element.getAttribute('data-tag-name').replace(/_/g, ' ');
      
      // 提取其他信息
      const isDeprecated = element.getAttribute('data-is-deprecated') === 'true';
      const links = Array.from(element.querySelectorAll('a')).map(a => a.textContent.trim());
      const postCountElement = element.querySelector('.post-count');
      const postCount = postCountElement ? postCountElement.getAttribute('title') : null;
      
      extractedTags.push({
        tag_name: tagName,
        is_deprecated: isDeprecated,
        links: links,
        post_count: postCount
      });
    });
    
    return extractedTags;
  };

  // ---------- D站Tag导入逻辑（前端获取HTML版本）---------- 
  const handleLoadDsiteTags = async () => {
    if (!dsiteInput.trim()) return;
    
    setDsiteLoading(true);
    try {
      // 前端直接获取HTML
      console.log('正在获取HTML...');
      const htmlResponse = await fetch(dsiteInput, {
        method: 'GET',
        mode: 'cors', // 可能需要CORS扩展或代理
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!htmlResponse.ok) {
        throw new Error(`HTTP ${htmlResponse.status}: ${htmlResponse.statusText}`);
      }
      
      const htmlContent = await htmlResponse.text();
      console.log('HTML获取成功，开始解析...');
      
      // 前端解析HTML提取标签
      const extractedTags = parseHtmlForTags(htmlContent);
      console.log('解析到标签数量:', extractedTags.length);
      
      if (extractedTags.length === 0) {
        alert('未找到任何标签，请检查URL是否正确');
        return;
      }
      
      // 提取标签名称用于翻译
      const tagNames = extractedTags.map(tag => tag.tag_name);
      
      // 调用后端翻译API
      console.log('正在翻译标签...');
      const translateResponse = await fetch('/api/Tagtranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: tagNames })
      });
      
      if (!translateResponse.ok) {
        throw new Error('翻译API调用失败');
      }
      
      const translateData = await translateResponse.json();
      const translatedTexts = translateData.translated_texts;
      
      // 组合翻译结果
      const newTags = extractedTags.map((tag, index) => ({
        originalEnText: tag.tag_name,
        cnText: (translatedTexts && translatedTexts[index]) ? translatedTexts[index] : tag.tag_name,
        curlyCount: 0,
        squareCount: 0,
        is_deprecated: tag.is_deprecated,
        post_count: tag.post_count
      }));
      
      setDsiteTags(prev => [...prev, ...newTags]);
      console.log('标签加载完成');
      
    } catch (error) {
      console.error('D站标签加载失败:', error);
      let errorMessage = '加载失败: ';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage += '无法访问该网站，可能是CORS跨域问题。请尝试：\n' +
                      '1. 安装CORS浏览器扩展\n' +
                      '2. 使用代理服务\n' +
                      '3. 或者检查网络连接';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setDsiteLoading(false);
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
                <Button 
                  variant="contained" 
                  onClick={handleLoadDsiteTags} 
                  size="small"
                  disabled={dsiteLoading}
                >
                  {dsiteLoading ? '加载中...' : '解析'}
                </Button>
                <Button variant="outlined" color="error" onClick={handleClearDsiteTags} size="small">
                  清空
                </Button>
              </Box>
            </Box>
            
            {/* 使用提示 */}
            <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: 'info.contrastText' }}>
                💡 提示：该功能需可访问Danbooru，如遇问题，请安装CORS浏览器扩展或使用代理
              </Typography>
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
                    <Button variant="outlined" startIcon={<GroupIcon />} href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=CdpNbaIcbz34wRENnz51fq4cmn8w97_u&authKey=lWSd%2BdH732ZphzYm6of0vZOq2k16qOUfHTK19kWRaJ73%2BdtcVBzWLHdYcVPo2Z5V&noverify=0&group_code=619176101" target="_blank" sx={{ justifyContent: 'flex-start' }}>
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