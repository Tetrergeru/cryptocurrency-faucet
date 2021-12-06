import React from 'react';
import {
	ThemeProvider,
	themeLight,
	themeDark,
	Container,
	Block,
} from '@lidofinance/lido-ui';
import SignIn from './SignIn';
import User from './User';
import Page from './page/page';
import { useGlobalContext } from './globalContext';
import styled from 'styled-components';
import { myThemeLight } from './myTheme';

const FullBlock = styled(Block)`
	border-radius: 0;
`;

export default function App() {
	const globalState = useGlobalContext();
	return (
		<ThemeProvider
			theme={globalState.content.theme === 'dark' ? themeDark : myThemeLight}
		>
			<FullBlock color="background">
				{globalState.content.loginned ? <Page /> : <SignIn />}
			</FullBlock>
		</ThemeProvider>
	);
}
