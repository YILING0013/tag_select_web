//page.js
"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Fab, // 用于悬浮按钮
  Modal, // 用于弹出窗口
  Backdrop,
  Fade,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CloudDoneIcon from '@mui/icons-material/CloudDone'; // 验证成功后的云图标
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'; // 初始状态的云图标

import { CategoryTabs } from '../models/CategoryTabs';
import { Sidebar } from '../models/Sidebar';
import { OutputSection } from '../models/OutputSection';

// Turnstile 组件
const TurnstileWidget = ({ onVerify, onExpire, isVisible }) => {
    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);
    const siteKey = "0x4AAAAAAB2E97PzSiDUYQxa";

    useEffect(() => {
        const scriptId = 'turnstile-script';
        
        const renderWidget = () => {
            if (window.turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
                const widgetId = window.turnstile.render(turnstileRef.current, {
                    sitekey: siteKey,
                    callback: function(token) {
                        console.log(`Challenge Success ${token}`);
                        onVerify(token);
                    },
                    'expired-callback': function() {
                        console.log('Challenge Expired');
                        onExpire();
                        if (widgetIdRef.current) {
                           window.turnstile.reset(widgetIdRef.current);
                        }
                    },
                });
                widgetIdRef.current = widgetId;
            }
        };

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = renderWidget;
            document.head.appendChild(script);
        } else {
            renderWidget();
        }
        
        if (isVisible && widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
        }

    }, [onVerify, onExpire, siteKey, isVisible]);

    return <div ref={turnstileRef}></div>;
};

// 为弹窗内容定义样式，确保其居中并位于顶层
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  outline: 'none',
  textAlign: 'center',
};


function App() {
  const [tags, setTags] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState(null);

  // 10分钟自动刷新验证状态
  useEffect(() => {
      const interval = setInterval(() => {
          console.log('自动刷新验证状态');
          setIsVerified(false); 
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(interval);
  }, []);

  // 监听API错误，如果是403则自动弹出验证
  useEffect(() => {
      if (apiError && apiError.status === 403) {
          console.log('检测到403错误，需要验证');
          setIsVerified(false);
          setShowModal(true);
          setApiError(null); // 处理后重置错误
      }
  }, [apiError]);


  const handleAddTag = (newTag) => {
    setTags(prevTags => [
      ...prevTags,
      { ...newTag, id: Date.now().toString() + Math.random().toString() }
    ]);
  };

  const handleUpdateTag = (updatedTag) => {
    setTags(prevTags =>
      prevTags.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
    );
  };

  const handleDeleteTag = (tagId) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  const handleReorderTags = (newList) => {
    setTags(newList);
  };

  const handleClearTags = () => {
    setTags([]);
  };

  const handleFabClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleVerification = async (token) => {
    try {
        const response = await fetch('/api/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('验证成功！');
            setIsVerified(true);
            setShowModal(false);
        } else {
            console.error('验证失败:', data.message);
            setIsVerified(false);
        }
    } catch (error) {
        console.error('验证Token时出错:', error);
        setIsVerified(false);
    }
  };

  return (
    <>
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
      <Grid container spacing={0.5} sx={{ flex: 1,  minHeight: { xs: 550, sm: 0 }  }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%',}}>
          <CategoryTabs onAddTag={handleAddTag} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%',}}>
          <Sidebar onAddTag={handleAddTag} setApiError={setApiError} />
        </Grid>
      </Grid>
    </Container>

    <Fab
        sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: isVerified ? 'success.main' : 'warning.main', 
            '&:hover': {
                backgroundColor: isVerified ? 'success.dark' : 'warning.dark',
            },
        }}
        onClick={handleFabClick}
        aria-label="verify"
      >
        {isVerified ? <CloudDoneIcon /> : <CloudOutlinedIcon />}
      </Fab>
      
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }, 
          },
        }}
      >
        <Fade in={showModal}>
          <Box sx={modalStyle}>
              <Typography sx={{ color: 'white', mb: 2, fontSize: '1rem' }}>
                请完成人机验证
              </Typography>
              <TurnstileWidget 
                onVerify={handleVerification}
                onExpire={() => setIsVerified(false)}
                isVisible={showModal}
              />
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

export default function Home() {
  return (
    <div style={{ height: '100vh' }}>
      <App />
    </div>
  );
}