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

export default class App extends React.Component<
	Record<string, never>,
	{ user?: User }
> {
	constructor(props: Record<string, never>) {
		super(props);
		this.state = {
			user: undefined,
		};
	}

	render() {
		return (
			<ThemeProvider theme={themeDark}>
				{this.state.user ? (
					<Page user={this.state.user} />
				) : (
					<SignIn setUser={user => this.setState({ user: user })} />
				)}
			</ThemeProvider>
		);
	}
}
