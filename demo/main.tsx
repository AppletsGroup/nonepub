import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Link, Route } from 'wouter'
import App from './app'
import Mobile from './mobile'
import VVDemo from './visual-viewport-demo'

const Wrapper = () => {
  return (
    <>
      <Route path="/pc" component={App} />
      <Route path="/mobile" component={Mobile} />
      <Route path="/vv-demo" component={VVDemo} />
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Wrapper />
  </React.StrictMode>,
  document.getElementById('root'),
)
