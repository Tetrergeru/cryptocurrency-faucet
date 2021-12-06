import React from 'react';
import {
	ThemeProvider,
	themeLight,
	themeDark,
	Container,
} from '@lidofinance/lido-ui';
import SignIn from './SignIn';
import User from './User';
import Page from './page/page';
import { useGlobalContext } from './globalContext';

export default function App() {
	const globalState = useGlobalContext();
	return (
		<ThemeProvider theme={themeDark}>
			{ globalState.content.loginned ? (
				<Page />
			) : (
				<SignIn/>
			)}
		</ThemeProvider>
	);
}

