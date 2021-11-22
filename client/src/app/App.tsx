import React from 'react';
import { ThemeProvider, themeDark, Container } from '@lidofinance/lido-ui';
import MainPage from './MainPage';
import SignIn from './SignIn';
import User from './User';

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
					<MainPage user={this.state.user} />
				) : (
					<SignIn setUser={user => this.setState({ user: user })} />
				)}
			</ThemeProvider>
		);
	}
}
