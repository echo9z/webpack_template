import React from "react";
import './index.less'
import { ConfigProvider, Button } from 'antd';
const Home = () => {

  const [title, setTitle] = React.useState('这是home组件')
  return (
    <div>
      <h2 className="home-title">{title}</h2>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Button>按钮</Button>
      </ConfigProvider>
    </div>
  )
}

export default Home;