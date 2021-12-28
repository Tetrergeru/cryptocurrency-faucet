import React from 'react';
import { ThemeProvider, themeDark, Block, Loader } from '@lidofinance/lido-ui';
import SignIn from './SignIn';
import Page from './page/page';
import { LoginStatus, useGlobalContext } from './globalContext';
import styled from 'styled-components';
import { myThemeLight } from './myTheme';
import { udateUserApi } from './page/serverContext';

const FullBlock = styled(Block)`
	border-radius: 0;
`;

export default function App() {
	const globalState = useGlobalContext();
	udateUserApi();
	return (
		<ThemeProvider
			theme={globalState.content.theme === 'dark' ? themeDark : myThemeLight}
		>
			<FullBlock color="background">
				{globalState.content.loginned === LoginStatus.Loginned ? <Page /> :
				globalState.content.loginned === LoginStatus.Logouted ? <SignIn /> :
				<Loader/>}
			</FullBlock>
		</ThemeProvider>
	);
}
