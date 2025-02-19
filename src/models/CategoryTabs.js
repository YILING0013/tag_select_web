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
  const [jsonData, setJsonData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

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

  // 加载点击的JSON文件
  const loadJsonFile = async (fileName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/json-files/${fileName}`);
      const data = await response.json();
      setJsonData(data);
    } catch (error) {
      console.error('Error loading JSON data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 选项卡切换事件
  const handleCategoryTabChange = (event, newValue) => {
    setCategoryTab(newValue);
    loadJsonFile(jsonFiles[newValue]);
  };

  // 生成标签内容，只接收一个参数
  const renderAccordion = (data) => {
    return Object.keys(data).map((key) => (
      <Accordion key={key}>
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
            {Object.entries(data[key]).map(([enLabel, cnLabel]) => (
              <Chip
                key={enLabel}
                label={`${cnLabel} (${enLabel})`}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  // 默认加载第一个选项卡的数据
  React.useEffect(() => {
    if (jsonFiles.length > 0) {
      loadJsonFile(jsonFiles[0]);
    }
  }, [jsonFiles]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
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
            overflow: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              {Object.keys(jsonData).length > 0 ? (
                renderAccordion(jsonData)
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
