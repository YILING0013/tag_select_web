// Sidebar.js
import * as React from 'react';
import { 
  Card, CardContent, Tabs, Tab, Box, Typography, TextField, Button, Alert
} from '@mui/material';

import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FavoriteIcon from '@mui/icons-material/Favorite';

// 接收 setApiError 作为 prop
export const Sidebar = ({ onAddTag, setApiError }) => {
  const [sidebarTab, setSidebarTab] = React.useState(3);

  const [customInput, setCustomInput] = React.useState('');
  const [customTags, setCustomTags] = React.useState([]);
  const [customError, setCustomError] = React.useState(null); // 自定义模块的错误状态

  const [dsiteInput, setDsiteInput] = React.useState('');
  const [dsiteTags, setDsiteTags] = React.useState([]);
  const [dsiteLoading, setDsiteLoading] = React.useState(false);
  const [dsiteError, setDsiteError] = React.useState(null); // D站模块的错误状态

  const [searchInput, setSearchInput] = React.useState('');
  const [maxResults, setMaxResults] = React.useState('');
  const [searchTags, setSearchTags] = React.useState([]);
  const [searchError, setSearchError] = React.useState(null); // 搜索模块的错误状态

  const handleSidebarTabChange = (event, newValue) => {
    setSidebarTab(newValue);
  };

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

  const handleLoadCustomTags = async () => {
    if (!customInput.trim()) return;
    setCustomError(null); // 重置错误
    const texts = customInput.split(',').map(s => s.trim()).filter(s => s);
    try {
      const response = await fetch('/api/Tagtranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });

      if (response.status === 403) {
        const errorMsg = "翻译请求被拒绝，请先完成人机验证。";
        setCustomError(errorMsg);
        setApiError({ status: 403, message: errorMsg });
        return;
      }

      if (!response.ok) throw new Error(`翻译API错误: ${response.statusText}`);

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
      setCustomError(error.message);
      // 失败时依然添加未翻译的tags
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
    setCustomError(null);
  };

  const parseHtmlForTags = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const tagElements = doc.querySelectorAll('[data-tag-name]');
    const extractedTags = [];
    tagElements.forEach(element => {
      const tagName = element.getAttribute('data-tag-name').replace(/_/g, ' ');
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

  const handleLoadDsiteTags = async () => {
    if (!dsiteInput.trim()) return;
    
    setDsiteLoading(true);
    setDsiteError(null); 
    try {
      const htmlResponse = await fetch(dsiteInput, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (htmlResponse.status === 403) {
        const errorMsg = "访问被拒绝，请先完成人机验证。";
        setDsiteError(errorMsg);
        setApiError({ status: 403, message: errorMsg });
        return;
      }
      
      if (!htmlResponse.ok) {
        throw new Error(`HTTP ${htmlResponse.status}: ${htmlResponse.statusText}`);
      }
      
      const htmlContent = await htmlResponse.text();
      const extractedTags = parseHtmlForTags(htmlContent);
      
      if (extractedTags.length === 0) {
        setDsiteError("未找到任何标签，请检查URL是否正确。");
        return;
      }
      
      const tagNames = extractedTags.map(tag => tag.tag_name);
      
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
      
      const newTags = extractedTags.map((tag, index) => ({
        originalEnText: tag.tag_name,
        cnText: (translatedTexts && translatedTexts[index]) ? translatedTexts[index] : tag.tag_name,
        curlyCount: 0,
        squareCount: 0,
        is_deprecated: tag.is_deprecated,
        post_count: tag.post_count
      }));
      
      setDsiteTags(prev => [...prev, ...newTags]);
      
    } catch (error) {
      let errorMessage = '加载失败: ' + error.message;
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = '无法访问该网站，可能是CORS跨域问题或网络连接错误。';
      }
      setDsiteError(errorMessage);
    } finally {
      setDsiteLoading(false);
    }
  };

  const handleClearDsiteTags = () => {
    setDsiteTags([]);
    setDsiteError(null);
  };

  const handleSearch = async (type) => {
    if (!searchInput.trim()) return;
    setSearchError(null); 
    try {
      const url = `/search/${type}?query=${encodeURIComponent(searchInput)}` + 
                  (maxResults.trim() ? `&max_results=${encodeURIComponent(maxResults)}` : '');
      const response = await fetch(url);

      if (response.status === 403) {
        const errorMsg = "搜索请求被拒绝，请先完成人机验证。";
        setSearchError(errorMsg);
        setApiError({ status: 403, message: errorMsg });
        return;
      }

      if (!response.ok) throw new Error(`搜索失败，状态码: ${response.status}`);
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
      setSearchError(error.message);
    }
  };

  const handleClearSearchTags = () => {
      setSearchTags([]);
      setSearchError(null);
  };

  const getSidebarTabContent = (index) => {
    switch (index) {
      case 0:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth multiline minRows={3} maxRows={5}
                  placeholder="请在此输入你的tag串, tag将按照逗号划分开并添加为页面元素"
                  value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" onClick={handleLoadCustomTags} size="small">加载</Button>
                <Button variant="outlined" color="error" onClick={handleClearCustomTags} size="small">清空</Button>
              </Box>
            </Box>
            {customError && <Alert severity="error" sx={{ mt: 1 }}>{customError}</Alert>}
            <Box sx={tagContainerStyle}>
              {customTags.map((tag, idx) => (
                <Button key={idx} variant="outlined" size="small" onClick={() => onAddTag && onAddTag(tag)} sx={tagButtonStyle}>
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth multiline minRows={3} maxRows={4}
                placeholder="D站图像网址示例：https://danbooru.donmai.us/posts/114514"
                value={dsiteInput} onChange={(e) => setDsiteInput(e.target.value)}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="contained" onClick={handleLoadDsiteTags} size="small" disabled={dsiteLoading}>
                  {dsiteLoading ? '加载中...' : '解析'}
                </Button>
                <Button variant="outlined" color="error" onClick={handleClearDsiteTags} size="small">清空</Button>
              </Box>
            </Box>
            {dsiteError && <Alert severity="error" sx={{ mt: 1 }}>{dsiteError}</Alert>}
            <Box sx={tagContainerStyle}>
              {dsiteTags.map((tag, idx) => (
                <Button key={idx} variant="outlined" size="small" onClick={() => onAddTag && onAddTag(tag)} sx={tagButtonStyle}>
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth placeholder="搜索内容（中英文皆可）"
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              />
              <TextField
                placeholder="返回量" value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)} sx={{ width: 100 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => handleSearch('regular_expression')} size="small">正则</Button>
              <Button variant="contained" onClick={() => handleSearch('fuzzy_search')} size="small">模糊</Button>
              <Button variant="contained" onClick={() => handleSearch('exact_search')} size="small">精确</Button>
              <Button variant="outlined" color="error" onClick={handleClearSearchTags} size="small">清空</Button>
            </Box>
            {searchError && <Alert severity="error" sx={{ mt: 1 }}>{searchError}</Alert>}
            <Box sx={tagContainerStyle}>
              {searchTags.map((tag, idx) => (
                <Button key={idx} variant="outlined" size="small" onClick={() => onAddTag && onAddTag(tag)} sx={tagButtonStyle}>
                  {`${tag.cnText} (${tag.originalEnText})`}
                </Button>
              ))}
            </Box>
          </Box>
        );
      case 3:
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