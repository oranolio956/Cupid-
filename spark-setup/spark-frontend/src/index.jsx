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
	document.getElementById('root')
);