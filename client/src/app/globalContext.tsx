import React, { useContext } from 'react';


const defaultGlobalContent: {
	loginned: boolean,
	iteration: number,
} = {
	loginned: true,
	iteration: 0,
};

type contentType = typeof defaultGlobalContent;

class GlobalState {
	constructor(
		private update: (content: contentType) => void,
		readonly content: contentType
	) {}

	setLigin(loginned: boolean) {
		this.update({ ...this.content, loginned });
	}

	incIteracion() {
		this.update({ ...this.content, iteration: this.content.iteration + 1 });
	}
}

const GlobalStateContext = React.createContext<GlobalState | undefined>(undefined);

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
