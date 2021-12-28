import React from 'react';

export enum LoginStatus {
	Loginned,
	Logouted,
	Undefined,
}

const defaultGlobalContent: {
	loginned: LoginStatus;
	iteration: number;
	theme: 'light' | 'dark';
} = {
	loginned: LoginStatus.Undefined,
	iteration: 0,
	theme: 'dark',
};

type contentType = typeof defaultGlobalContent;

class GlobalState {
	constructor(
		private update: (content: contentType) => void,
		readonly content: contentType
	) {}

	setLigin(loginned: LoginStatus) {
		this.update({ ...this.content, loginned });
	}

	incIteracion() {
		console.log(this.content.iteration)
		this.update({ ...this.content, iteration: this.content.iteration + 1 });
	}

	setTheme(theme: typeof defaultGlobalContent.theme) {
		this.update({ ...this.content, theme });
	}
}

const GlobalStateContext = React.createContext<GlobalState | undefined>(
	undefined
);

interface ElementWithChildren {
	children: JSX.Element[] | JSX.Element | undefined;
}

export function GlobalProvider(props: ElementWithChildren) {
	const [content, setContent] = React.useState(defaultGlobalContent);

	return (
		<GlobalStateContext.Provider value={new GlobalState(setContent, content)}>
			{props.children}
		</GlobalStateContext.Provider>
	);
}

export function useGlobalContext() {
	const context = React.useContext(GlobalStateContext);
	if (context === undefined) {
		throw new Error('useGlobalContext must be used within a GlobalProvider');
	}
	return context;
}
