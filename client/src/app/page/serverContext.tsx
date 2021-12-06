import React, { useContext, useEffect } from 'react';
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
	UseQueryResult,
} from 'react-query';
import { Limit, ServerApi, TransferRequest, Wallet } from '../server';
import { Status, statusMessage } from './statusMessage';
import { ReactQueryDevtools } from 'react-query/devtools';
import { stat } from 'fs';
import { useGlobalContext } from '../globalContext';

interface ElementWithChildren {
	children: JSX.Element[] | JSX.Element | undefined;
}

const queryClient = new QueryClient();

export function ServerProvider(props: ElementWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			{/* <ReactQueryDevtools initialIsOpen={true`} /> */}
			{props.children}
		</QueryClientProvider>
	);
}

type ServerApiType = {
	wallets: Wallet[];
	limits: Limit[];
	status: statusMessage;
};

function getStatus<T>(
	query: UseQueryResult<T, any>,
	name: string
): statusMessage {
	if (query.isSuccess)
		return {
			status: Status.Success,
			message: `Success loading ${name}!`,
		};
	if (query.isIdle || query.isLoading)
		return {
			status: Status.Pending,
			message: `Loading ${name}...`,
		};
	if (query.isError)
		return {
			status: Status.Error,
			message: query.error,
		};
	return {
		status: Status.Error,
		message: 'Unknown react-query state',
	};
}

function getUserData(): Promise<any> {
	return fetch("/api/users/me").then(x =>
		x.ok ? x.json() : x.text().then(x => Promise.reject(x))
	)
}

export function useUserApi() {
	const queryUser = useQuery('Avatar query', getUserData);
	const status = getStatus(queryUser, 'user')
	const globalContext = useGlobalContext();

	if (status.status === Status.Error)
		globalContext.setLigin(false);

	return {
		data: queryUser.data || {},
		status: status
	}
}

export function useServerApi(): ServerApiType {
	const result: ServerApiType = {
		wallets: [],
		limits: [],
		status: { status: Status.Error, message: '' },
	};
	const globalState = useGlobalContext();
	const queryWallets = useQuery('Wallets query' + globalState.content.iteration, ServerApi.getWallets)

	result.wallets = queryWallets.data || [];
	result.status = getStatus(queryWallets, 'wallets');

	const queryLimits = useQuery('Limits query'+ globalState.content.iteration, ServerApi.getLimits, {
		enabled: result.status.status === Status.Success,
	});

	result.limits = queryLimits.data || [];
	if (result.status.status === Status.Success)
		result.status = getStatus(queryLimits, 'limits');
	return result;
}
