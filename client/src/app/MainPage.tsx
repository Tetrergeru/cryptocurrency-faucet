import React, { useRef, useState } from 'react';

import {
	HStack,
	StackItem,
	Block,
	Container,
	Option,
	Heading,
	Button,
	Plus,
	Terra,
	Text,
	Eth,
	Input,
	Modal,
	Error,
	Loader,
	Select,
	Success,
	InputGroup,
} from '@lidofinance/lido-ui';
import styled from 'styled-components';
import User from './User';
import { Coin, EthereumCoin, TerraCoin, UndefiendCoin } from './coins';
import { Limit, ServerApi, TransferRequest, Wallet } from './server';

function Header(props: { user: User; wallet?: Wallet }) {
	const { user, wallet } = props;
	return (
		<Container
			as="header"
			size="full"
			style={{
				height: '100px',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<HStack>
				{' '}
				{wallet ? (
					<Heading style={{ color: '#FFC700' }}>{wallet.name}</Heading>
				) : (
					<Heading>Crypto</Heading>
				)}
				<Heading>&nbsp;loot</Heading>
			</HStack>
		</Container>
	);
}

const FaucetButtonContainer = styled(Container)`
	cursor: pointer;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28px;
`

function CoinButton(props: {
	coin: Coin;
	onClick: (wallet: Wallet) => void;
	limit: number;
	wallet: Wallet;
}) {
	return (
		<FaucetButtonContainer
			onClick={() => props.onClick(props.wallet)}
		>
			<Heading size="sm">
				{props.coin.icon == 'Terra' ? (
					<Terra />
				) : props.coin.icon == 'Eth' ? (
					<Eth />
				) : undefined}
				&nbsp;&nbsp;{props.wallet.name}
			</Heading>
			<Text>
				{props.limit} / {props.wallet.balance[props.wallet.units[0]]} {props.wallet.units[0]}
			</Text>
		</FaucetButtonContainer>
	);
}

const FormStyled = styled(Container)`
	& > * {
		margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
	}
`

function MainForm({units, onSubmit}: {
	units: string[],
	onSubmit: (resuest: TransferRequest) => void
}) {
	const [targetWallet, setTargetWallet] = useState('');
	const [moneyCount, setMoneyCount] = useState('');
	const [unitIndex, setUnitIndex] = useState(0);
	if(units.length <= unitIndex)
		setUnitIndex(0)
	const inputGroupRef = useRef<HTMLSpanElement>(null);
	return (
		<FormStyled>
			<Input
				fullwidth
				placeholder="wallet"
				type="text"
				value={targetWallet}
				onChange={ev => setTargetWallet(ev.target.value)}
			/>
			<InputGroup ref={inputGroupRef}>
				<Select anchorRef={inputGroupRef}
					value={unitIndex}
					onChange={ev => setUnitIndex(ev as number)}
				>
					{units.map((value, i) => <Option key={i} value={i}>{value}</Option>)}
				</Select>
				<Input
					fullwidth
					placeholder="36.41"
					type="text"
					value={moneyCount}
					onChange={ev => setMoneyCount(ev.target.value)}
				/>
			</InputGroup>
			<Button
				fullwidth
				onClick={() => {
					onSubmit({ targetWallet, moneyCount: parseFloat(moneyCount), unit: units[unitIndex] });
				}}
			>
				Take
			</Button>
		</FormStyled>
	);
}

enum Status {
	Default,
	Pending,
	Error,
	Success,
}

export default class MainPage extends React.Component<
	{ user: User },
	{
		wallet?: Wallet;
		message?: string;
		wallets?: Wallet[];
		limits?: Limit;
		status: Status;
	}
> {
	constructor(props: { user: User }) {
		super(props);
		this.state = { status: Status.Default };
	}

	componentDidMount() {
		this.getUpdate();
	}

	setError(error: string) {
		this.setState({
			message: error,
			status: Status.Error,
		});
	}

	setPending(msg?: string) {
		this.setState({
			message: msg || '',
			status: Status.Pending,
		});
	}

	setSuccess(msg?: string) {
		this.setState({
			message: msg || '',
			status: Status.Success,
		});
	}

	setDefault() {
		this.setState({
			message: undefined,
			status: Status.Default,
		});
	}

	getUpdate() {
		ServerApi.getWallets()
			.then(w => {
				this.setState({ wallets: w });
			})
			.catch(e => this.setError(e));

		ServerApi.getLimits()
			.then(l => {
				this.setState({ limits: l[0] });
			})
			.catch(e => this.setError(e));
	}

	setCoin(wallet: Wallet) {
		this.setState({ wallet: wallet });
	}

	render() {
		return (
			<Container
				size="full"
				style={{
					maxWidth: '100%',
					margin: '0',
					height: '100%',
				}}
			>
				<Modal
					open={this.state.status === Status.Error}
					center
					title="Something went wrong"
					titleIcon={<Error color="red" height={64} width={64} />}
				>
					<Text>{this.state.message}</Text>
					<Button color="secondary" onClick={() => this.setDefault()}>
						OK
					</Button>
				</Modal>

				<Modal
					open={this.state.status === Status.Pending}
					center
					title="Loading..."
					titleIcon={<Loader size="large" />}
				>
					<Text>{this.state.message}</Text>
				</Modal>

				<Modal
					open={this.state.status === Status.Success}
					center
					title="Success"
					titleIcon={<Success color="green" height={64} width={64} />}
				>
					<Text>{this.state.message}</Text>
					<Button color="secondary" onClick={() => this.setDefault()}>
						OK
					</Button>
				</Modal>

				<Header user={this.props.user} wallet={this.state.wallet} />
				<Container as="main" size="full">
					<HStack
						align="flex-start"
						justify="space-between"
						spacing="md"
						wrap="wrap"
					>
						<StackItem basis="300px">
							<Block>
								<Text>
									<Plus /> Add wallet
								</Text>
							</Block>
						</StackItem>

						<StackItem basis="500px">
							{this.state.wallet ? <MainForm
								units={this.state.wallet.units}
								onSubmit={t => {
									if (!this.state.wallet) {
										this.setError('Wallet not set!');
										return;
									}
									this.setPending();
									ServerApi.postRequest(this.state.wallet.id, t)
										.then(w => {
											this.getUpdate();
											this.setSuccess();
										})
										.catch(e => this.setError(JSON.parse(e).status));
								}}
							/> : <Block>Choose a faucet from right panel</Block>}
						</StackItem>
						<StackItem
							basis="300px"
							style={{
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column',
								alignItems: 'center',
								maxHeight: '80vh',
								overflowY: 'auto',
								overflowX: 'hidden',
							}}
						>
							{/* <Heading size="sm" style={{ margin: "30px" }}>Coins</Heading> */}
							{this.state.wallets
								? this.state.wallets.map(w => {
									const walet_map: Record<string, Coin | undefined> = {
										ethereum: new EthereumCoin(),
										terra: new TerraCoin(),
									};
									const coin: Coin = walet_map[w.type] || new UndefiendCoin();
									return (
										<CoinButton
											key={w.id}
											limit={
												(this.state.limits && this.state.limits[w.id]) || 0
											}
											onClick={this.setCoin.bind(this)}
											coin={coin}
											wallet={w}
										></CoinButton>
									);
								})
								: null}
						</StackItem>
					</HStack>
				</Container>
				<Container as="footer" size="full"></Container>
			</Container>
		);
	}
}
