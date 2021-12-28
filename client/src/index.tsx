import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/App';
import reportWebVitals from './helpers/reportWebVitals';
import { GlobalProvider } from './app/globalContext';
import { ServerProvider } from './app/page/serverContext';

ReactDOM.render(
	<React.StrictMode>
		<GlobalProvider>
			<ServerProvider>
				<App />
			</ServerProvider>
		</GlobalProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
