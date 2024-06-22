import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Watch from './Watch.jsx'
import AmazonPage from './Amazon.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/playmovie" element={<Watch />} />
				<Route path="/amazonpage" element={<AmazonPage />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
)


