import React from "react";
const About = () => {
  const [title, setTitle] = React.useState('这是About---组件')
  return (
    <div>
      <h2>{title}</h2>
    </div>
  )
}

export default About;