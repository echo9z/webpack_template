import React, {Suspense, lazy} from 'react' // 路由懒加载，另一个lazy函数 
import { Link, Routes, Route } from 'react-router-dom'
import { Button, DatePicker } from 'antd';
// import Home from './pages/Home' // 要使用jsx语法时都需要使用react库
// import About from './pages/About'
const Home = lazy(() => import(/* webpackChunkName: "home" */ './pages/Home'))
const About = lazy(() => import(/* webpackChunkName: "about" */'./pages/About'))

const App = () => {
  const title = '标题你好啊，加油，you can never be ready App'
  const [str, setStr] = React.useState('这是一段文字')
  const onChangeHandler = (event) => {
    setStr(event.target.value)
  }
  return (
    <div>
      <h1>{title}</h1>
      <input type="text" value={str} onChange={onChangeHandler} />: {str}
      <Button type='primary'>按钮</Button>
      <DatePicker placeholder="select date" />
      <ul>
        <li><Link to="/home" >home</Link></li>
        <li><Link to="/about" >about</Link></li>
      </ul>
      {/* react中路由懒加载，必须包裹在 Suspense组件中 ,fallback是路由页面还没加载前，显示loading*/}
      <Suspense fallback={<div>loading......</div>}>
        {/* react的router的显示，理解为 vue中的router-view*/}
        <Routes>
          {/* react-router v5是 component={Home} */}
          <Route path='/home' element={<Home/>}></Route>
          <Route path='/about' element={<About/>}></Route>
        </Routes>
      </Suspense>
    </div>
  )
}
export default App;