import React from 'react'

import { Router, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import Home from './pages/Home'

import './App.css'

export const history = createBrowserHistory()

function App() {
    return (
        <Router history={history}>
            <div className="app">
                <Route path="/">
                    <Home />
                </Route>
            </div>
        </Router>
    )
}

export default App
