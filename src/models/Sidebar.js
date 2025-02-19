import * as React from 'react';
import { Card, CardContent, Tabs, Tab, Box, Typography, TextField, Button } from '@mui/material';

export const Sidebar = () => {
  const [sidebarTab, setSidebarTab] = React.useState(3);

  const handleSidebarTabChange = (event, newValue) => {
    setSidebarTab(newValue);
  };

  const getSidebarTabContent = (index) => {
    switch (index) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              自定义
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="请在此输入你的tag串, tag将按照逗号划分开并添加为页面元素"
              variant="outlined"
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                加载 Tag
              </Button>
              <Button variant="contained" color="error">
                清空 Tag
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              D站Tag导入
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="在此处输入D站某张图像的网址，例如：https://danbooru.donmai.us/posts/114514"
              variant="outlined"
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                加载 Tag
              </Button>
              <Button variant="contained" color="error">
                清空 Tag
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tag搜索
            </Typography>
            <TextField
              fullWidth
              placeholder="请在此输入你要搜索的内容，中英文皆可"
              variant="outlined"
            />
            <Box sx={{ marginTop: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                正则搜索
              </Button>
              <Button variant="contained" color="primary">
                模糊搜索
              </Button>
              <Button variant="contained" color="primary">
                精确搜索
              </Button>
            </Box>
            <TextField
              sx={{ marginTop: 2 }}
              fullWidth
              placeholder="返回量: 无值则全部返回"
              variant="outlined"
            />
          </Box>
        );
      case 3:
      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              关于
            </Typography>
            <Typography variant="body2">
              关于本网站：<br />
              本网站是一个提供词条查找功能的服务站点，隶属于 Xianyun Draw Web，相关规则等同于 Xianyun Draw Web 条款。<br />
              该tag网站的功能均为无偿提供使用，不会主动要求收费。<br />
              如有任何建议，欢迎通过相关渠道联系。
            </Typography>
            <Box sx={{ marginTop: 2 }}>
              <Button variant="outlined" color="primary">
                访问 Xianyun Draw Web
              </Button>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
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
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {getSidebarTabContent(sidebarTab)}
        </Box>
      </CardContent>
    </Card>
  );
};
