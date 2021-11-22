import React from 'react';

import {
	HStack,
	StackItem,
	Block,
	Container,
	Heading,
	Button,
	Twitter,
	Plus,
	Terra,
	Text,
	Eth,
	Input,
} from '@lidofinance/lido-ui';
import User from './User';
import { Coin, EtheriumCoin, TerraCoin } from './coins';

function Header(props: { user: User; coin?: Coin }) {
	const { user, coin } = props;
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
				{coin ? (
					<Heading style={{ color: coin.color }}>{coin.title}</Heading>
				) : (
					<Heading>Crypto</Heading>
				)}
				<Heading>&nbsp;loot</Heading>
			</HStack>
		</Container>
	);
}

function CoinButton(props: { coin: Coin; onClick: (coin: Coin) => void }) {
	return (
		<Block
			onClick={() => props.onClick(props.coin)}
			color="background"
			style={{
				width: '100%',
				margin: '30px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<Heading size="sm">
				{props.coin.icon == 'Terra' ? (
					<Terra />
				) : props.coin.icon == 'Eth' ? (
					<Eth />
				) : undefined}
				&nbsp;&nbsp;{props.coin.title}
			</Heading>
			<Text>{Math.random() * 10}</Text>
		</Block>
	);
}

export default class MainPage extends React.Component<
	{ user: User },
	{ coin?: Coin }
> {
	constructor(props: { user: User }) {
		super(props);
		this.state = {
			coin: undefined,
		};
	}

	setCoin(coin: Coin) {
		this.setState({ coin: coin });
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
				<Header user={this.props.user} coin={this.state.coin} />
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
							<Input
								placeholder="wallet"
								type="text"
								style={{
									width: '100%',
									margin: '10px',
								}}
							/>
							<Input
								placeholder="36.41"
								type="text"
								style={{
									width: '100%',
									margin: '10px',
								}}
							/>
							<Button
								style={{
									width: '100%',
									margin: '10px',
								}}
							>
								Take
							</Button>
						</StackItem>

						<StackItem
							basis="300px"
							style={{
								display: 'flex',
								justifyContent: 'center',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							{/* <Heading size="sm" style={{ margin: "30px" }}>Coins</Heading> */}
							<CoinButton
								onClick={this.setCoin.bind(this)}
								coin={new EtheriumCoin()}
							></CoinButton>
							<CoinButton
								onClick={this.setCoin.bind(this)}
								coin={new TerraCoin()}
							></CoinButton>
						</StackItem>
					</HStack>
				</Container>
				<Container as="footer" size="full"></Container>
			</Container>
		);
	}
}
