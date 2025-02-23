/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    //打包时取消注释
    basePath: '/static/frontend',  // 设置基础路径
    assetPrefix: '/static/frontend',  // 设置静态资源路径前缀
  };
  
  export default nextConfig;
  