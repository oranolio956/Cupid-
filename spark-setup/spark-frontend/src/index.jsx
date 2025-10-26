import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import Wrapper from './components/wrapper';
import ErrorBoundary from './components/ErrorBoundary';
import Err from './pages/404';
import axios from 'axios';
import {message} from 'antd';
import i18n from "./locale/locale";

import './global.css';
import 'antd/dist/reset.css';
import Overview from "./pages/overview";
import Login from "./pages/login";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import {translate} from "./utils/utils";

// Global error handlers for debugging
window.addEventListener('error', (event) => {
	console.error('Global error caught:', {
		message: event.message,
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno,
		error: event.error
	});
	// Show visual indicator
	const errorDiv = document.createElement('div');
	errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff4d4f;color:white;padding:10px;z-index:99999;font-family:monospace;font-size:12px;';
	errorDiv.innerHTML = `ERROR: ${event.message} at ${event.filename}:${event.lineno}`;
	document.body.appendChild(errorDiv);
});

window.addEventListener('unhandledrejection', (event) => {
	console.error('Unhandled promise rejection:', event.reason);
	const errorDiv = document.createElement('div');
	errorDiv.style.cssText = 'position:fixed;top:40px;left:0;right:0;background:#ff7a45;color:white;padding:10px;z-index:99999;font-family:monospace;font-size:12px;';
	errorDiv.innerHTML = `PROMISE REJECTION: ${event.reason}`;
	document.body.appendChild(errorDiv);
});

console.log('Spark Frontend Starting...', {
	apiUrl: process.env.REACT_APP_API_URL,
	wsUrl: process.env.REACT_APP_WS_URL,
	environment: process.env.REACT_APP_ENVIRONMENT,
	nodeEnv: process.env.NODE_ENV
});

// Use environment variable for API URL, fallback to production backend
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://spark-backend-wj4e.onrender.com';
// Enable cookies for authentication (Spark uses cookie-based auth)
axios.defaults.withCredentials = true;
// Set timeout to handle Render cold starts (can take 30-60 seconds)
axios.defaults.timeout = 90000;
// Development logging removed for production
axios.interceptors.response.use(async res => {
	let data = res.data;
	if (data.hasOwnProperty('code')) {
		if (data.code !== 0){
			message.warn(translate(data.msg));
		}
	}
	return Promise.resolve(res);
}, err => {
	// console.error(err);
	if (err.code === 'ECONNABORTED') {
		message.error(i18n.t('COMMON.REQUEST_TIMEOUT'));
		return Promise.reject(err);
	}
	let res = err.response;
	let data = res?.data ?? {};
	
	// Handle authentication errors
	if (res?.status === 401) {
		message.error('Authentication required. Please login.');
		// Redirect to login page (HashRouter requires #/)
		window.location.href = '/#/login';
		return Promise.reject(err);
	}
	
	if (data.hasOwnProperty('code') && data.hasOwnProperty('msg')) {
		if (data.code !== 0){
			message.warn(translate(data.msg));
			return Promise.resolve(res);
		}
	}
	return Promise.reject(err);
});

// Remove loading indicator and render app
const rootElement = document.getElementById('root');
const loadingIndicator = document.getElementById('loading-indicator');

console.log('Rendering React app...');

// Hide loading indicator after React renders
const hideLoadingIndicator = () => {
	console.log('Hiding loading indicator');
	if (loadingIndicator) {
		loadingIndicator.style.display = 'none';
	}
};

// Fallback: hide after 2 seconds even if React doesn't fully render
setTimeout(hideLoadingIndicator, 2000);

ReactDOM.render(
		<ErrorBoundary>
			<AuthProvider>
				<Router>
					<Routes>
						<Route path="/login" element={<Login/>}/>
						<Route path="/" element={
							<ProtectedRoute>
								<Wrapper><Overview/></Wrapper>
							</ProtectedRoute>
						}/>
						<Route path="*" element={<Err/>}/>
					</Routes>
				</Router>
			</AuthProvider>
		</ErrorBoundary>,
	rootElement,
	() => {
		console.log('React app mounted');
		hideLoadingIndicator();
	}
);