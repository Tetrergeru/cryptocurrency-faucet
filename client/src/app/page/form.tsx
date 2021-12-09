import {
	Button,
	HStack,
	Input,
	StackItem,
	Text,
	VStack,
	Block,
	Heading,
	Modal,
	Terra,
	Eth,
	Ldo,
	Link,
	Tooltip,
} from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { useGlobalContext } from '../globalContext';
import { ServerApi, TransferRequest } from '../server';
import { FormProvider, useFormContext } from './formContext';
import { useServerApi } from './serverContext';
import { Status, StatusIcon } from './statusMessage';

interface ElementWithChildren {
	children:
		| (JSX.Element[] | JSX.Element | undefined)[]
		| JSX.Element
		| undefined;
}

function FormItem(props: ElementWithChildren) {
	const _children = props.children
		? Array.isArray(props.children)
			? props.children
			: [props.children]
		: [];
	const children = _children.flat();
	return (
		<StackItem>
			<VStack spacing="md" align="stretch">
				{children.map((c, i) =>
					c ? <StackItem key={i}> {c} </StackItem> : undefined
				)}
			</VStack>
		</StackItem>
	);
}

const NetworkTileBlock = styled(Block)`
	height: 100px;
	width: 100px;
	border-width: 1px;
	border-style: solid;
	border-color: #00000000;
	&:hover {
		border-color: #009df5;
	}
`;

function NetwoorkIcon(props: { type: string }) {
	switch (props.type) {
		case 'ethereum':
			return <Eth />;
		case 'terra':
			return <Terra />;
		default:
			return <Ldo />;
	}
}

function NetworkItem() {
	const server = useServerApi();
	const form = useFormContext();
	return (
		<FormItem>
			<Heading size="sm">Network</Heading>
			<HStack align="flex-start" justify="center" spacing="xl" wrap="wrap">
				{server.status.status === Status.Success
					? server.wallets.map(w => {
							const isActive =
								form.content.network && form.content.network.id === w.id;
							const denom = w.denoms[0];
							const balance = server.limits[0][w.id][w.denoms[0]];
							const limitCutLen = 5;
							return (
								<StackItem key={w.name}>
									<NetworkTileBlock
										onClick={() => form.setNetwork(w)}
										color={isActive ? 'foreground' : 'accent'}
									>
										<VStack justify="center" align="center" spacing="sm">
											<StackItem>
												<NetwoorkIcon type={w.type} />
											</StackItem>
											<StackItem>
												<Text size="sm">{w.name}</Text>
											</StackItem>
											<StackItem>
												<Tooltip title={balance}>
													<Text size="sm">
														{`${denom}: ${
															balance.length > limitCutLen
																? balance.substr(0, limitCutLen) + '..'
																: balance
														}`}
													</Text>
												</Tooltip>
											</StackItem>
										</VStack>
									</NetworkTileBlock>
								</StackItem>
							);
					  })
					: undefined}
				{server.status.status != Status.Success ? (
					<VStack justify="center" align="center">
						<StackItem>
							<StatusIcon status={server.status.status} />
						</StackItem>
						<StackItem>
							<Text>{server.status.message}</Text>
						</StackItem>
					</VStack>
				) : undefined}
			</HStack>
		</FormItem>
	);
}

function AmountItem() {
	const form = useFormContext();
	const server = useServerApi();
	const iterate = ['1', '3', '5', '15'];

	return (
		<FormItem>
			<Heading size="sm">Amount</Heading>
			{/* <Text>Text?</Text> */}
			{form.content.network ? (
				<HStack justify="space-between">
					{iterate.map(v => (
						<StackItem key={v} basis="23%">
							<Button fullwidth onClick={() => form.setAmount(v)}>
								{`${v} ${form.content.network?.denoms[0]}`}
							</Button>
						</StackItem>
					))}
				</HStack>
			) : undefined}
			<Input
				label={form.content.network?.denoms[0]}
				disabled={!form.content.network}
				fullwidth
				onChange={e => form.setAmount(e.target.value)}
				value={form.content.amount}
			></Input>
		</FormItem>
	);
}

function WalletItem() {
	const form = useFormContext();
	return (
		<FormItem>
			<Heading size="sm">Wallet</Heading>
			{/* <Text>Text?</Text> */}
			<Input
				fullwidth
				onChange={e => form.setWallet(e.target.value)}
				placeholder="0x2bc29de92bc38a920df70dd320acb2c1012cbafb"
				value={form.content.wallet}
			></Input>
		</FormItem>
	);
}

function SubmitButtonItem() {
	const form = useFormContext();
	const globalContext = useGlobalContext();

	return (
		<FormItem>
			<Button
				disabled={!(form.content.amount && form.content.wallet)}
				fullwidth
				onClick={() => {
					const network = form.content.network;
					if (!network) return;
					const request: TransferRequest = {
						denom: network.denoms[0],
						moneyCount: form.content.amount,
						targetWallet: form.content.wallet,
					};
					ServerApi.postRequest(network.id, request)
						.then(w => {
							globalContext.incIteracion();
							form.setModal({
								status: Status.Success,
								message: w,
							});
						})
						.catch(e =>
							form.setModal({
								status: Status.Error,
								message: JSON.parse(e).status,
							})
						);
					form.setModal({
						status: Status.Pending,
						message: 'Processing transaction',
					});
				}}
			>
				Get Coins
			</Button>
		</FormItem>
	);
}

function ModalState() {
	const form = useFormContext();
	const status = form.content.ststus;

	return (
		<div>
			<Modal
				open={status && status?.status === Status.Error}
				center
				title="Something went wrong"
				titleIcon={<StatusIcon status={Status.Error} />}
			>
				<Text>{form.content.ststus?.message}</Text>
				<Button color="secondary" onClick={() => form.setModal(undefined)}>
					OK
				</Button>
			</Modal>
			<Modal
				open={status && status?.status === Status.Pending}
				center
				title="Loading..."
				titleIcon={<StatusIcon status={Status.Pending} />}
			>
				<Text>{form.content.ststus?.message}</Text>
			</Modal>

			<Modal
				open={status && status?.status === Status.Success}
				center
				title="Success"
				titleIcon={<StatusIcon status={Status.Success} />}
			>
			{/* <Text>{form.content.ststus?.message}</Text> */}
				{(() => {
						if (!form.content.ststus || form.content.ststus.status !== Status.Success) return undefined;
						console.log(form.content.ststus.message);
						const json = JSON.parse(form.content.ststus.message);
						return <>
							<Text>{json.message}<br/>
							<Link href={json.transactionURL}>{json.transactionURL}</Link>
							</Text>
						</>
					})()}
				<Button color="secondary" onClick={() => form.setModal(undefined)}>
					OK
				</Button>
			</Modal>
		</div>
	);
}

export default function Form() {
	return (
		<FormProvider>
			<ModalState />
			<VStack
				justify="center"
				align="stretch"
				spacing="xxl"
				style={{
					maxWidth: '800px',
					margin: '0 auto',
				}}
			>
				<NetworkItem />
				<AmountItem />
				<WalletItem />
				<SubmitButtonItem />
			</VStack>
		</FormProvider>
	);
}
