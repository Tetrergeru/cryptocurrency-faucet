import React, { useContext } from 'react';
import { Wallet } from '../server';
import { statusMessage } from './statusMessage';

const defaultFormContent: {
	network?: Wallet;
	wallet: string;
	amount: string;
	ststus?: statusMessage;
} = {
	wallet: '',
	amount: '',
};

type contentType = typeof defaultFormContent;

class FormState {
	constructor(
		private update: (content: contentType) => void,
		readonly content: contentType
	) {}

	setWallet(wallet: string) {
		this.update({ ...this.content, wallet });
	}

	setNetwork(network: Wallet) {
		this.update({ ...this.content, network });
	}

	setAmount(amount: string) {
		this.update({ ...this.content, amount });
	}

	setModal(ststus?: statusMessage) {
		this.update({ ...this.content, ststus });
	}
}

const formStateContext = React.createContext<FormState | undefined>(undefined);

interface ElementWithChildren {
	children: JSX.Element[] | JSX.Element | undefined;
}

export function FormProvider(props: ElementWithChildren) {
	const [content, setContent] = React.useState(defaultFormContent);

	return (
		<formStateContext.Provider value={new FormState(setContent, content)}>
			{props.children}
		</formStateContext.Provider>
	);
}

export function useFormContext() {
	const context = React.useContext(formStateContext);
	if (context === undefined) {
		throw new Error('useFormContext must be used within a FormProvider');
	}
	return context;
}
