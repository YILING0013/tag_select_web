import * as React from 'react';
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
} from '@mui/material';

export const CategoryTabs = () => {
  const [categoryTab, setCategoryTab] = React.useState(0);
  const [jsonFiles, setJsonFiles] = React.useState([]);
  const [jsonKeys, setJsonKeys] = React.useState([]);
  const [jsonData, setJsonData] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null); // 用于控制哪些折叠栏展开

  // 读取json文件列表
  React.useEffect(() => {
    async function fetchJsonFiles() {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/json-files');
        const files = await response.json();
        setJsonFiles(files);
      } catch (error) {
        console.error('Error fetching JSON files:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJsonFiles();
  }, []);

  // 加载选项卡的字典键
  const loadJsonKeys = async (fileName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/json-files/${fileName}/keys`);
      const keys = await response.json();
      setJsonKeys(keys);
    } catch (error) {
      console.error('Error loading JSON keys:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载特定字典的内容
  const loadJsonKeyContent = async (fileName, key) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/json-files/${fileName}/keys/${key}`);
      const data = await response.json();
      setJsonData((prevData) => ({
        ...prevData,
        [key]: data,
      }));
    } catch (error) {
      console.error('Error loading JSON key content:', error);
    } finally {
      setLoading(false);
    }
  };

  // 选项卡切换事件
  const handleCategoryTabChange = (event, newValue) => {
    setCategoryTab(newValue);
    setJsonData({}); // 清空已加载的数据
    loadJsonKeys(jsonFiles[newValue]);
  };

  // 处理折叠栏展开事件
  const handleAccordionChange = (key) => {
    setExpanded(expanded === key ? null : key); // 切换展开或折叠
    if (!jsonData[key]) {
      loadJsonKeyContent(jsonFiles[categoryTab], key);
    }
  };

  // 默认加载第一个选项卡的字典键
  React.useEffect(() => {
    if (jsonFiles.length > 0) {
      loadJsonKeys(jsonFiles[0]);
    }
  }, [jsonFiles]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', minHeight: 300, flexDirection: 'column', p: 0 }}>
        <Tabs
          value={categoryTab}
          onChange={handleCategoryTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {jsonFiles.map((file) => (
            <Tab key={file} label={file.replace('.json', '')} />
          ))}
        </Tabs>
        <Box
          sx={{
            flex: 1,
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {jsonKeys.length > 0 ? (
                jsonKeys.map((key) => (
                  <Accordion
                    key={key}
                    expanded={expanded === key} // 只展开当前折叠栏
                    onChange={() => handleAccordionChange(key)}
                  >
                    <AccordionSummary>
                      <Typography variant="body1">{key}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1, // 标签之间的间距
                        }}
                      >
                        {jsonData[key] ? (
                          Object.entries(jsonData[key]).map(([enLabel, cnLabel]) => (
                            <Chip
                              key={enLabel}
                              label={`${cnLabel} (${enLabel})`}
                              variant="outlined"
                              size="small"
                            />
                          ))
                        ) : (
                          <CircularProgress size={20} />
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography variant="body2">请选择一个选项卡</Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
