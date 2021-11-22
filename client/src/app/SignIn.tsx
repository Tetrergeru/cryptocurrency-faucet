import React from 'react';

import {
	Button,
	Block,
	Container,
	VStack,
	Heading,
} from '@lidofinance/lido-ui';
import User from './User';

type setUserCallback = (user: User) => void;

export default function SignIn(props: { setUser: setUserCallback }) {
	return (
		<VStack align="center" justify="center" style={{ minHeight: '100%' }}>
			<Block
				style={{
					width: '500px',
					minHeight: '500px',
				}}
			>
				<Heading
					style={{
						textAlign: 'center',
						margin: '30px',
					}}
				>
					Crypto loot
				</Heading>
				<Container
					style={{
						margin: '150px auto 0 auto',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<Button
						style={{
							backgroundColor: 'white',
						}}
						onClick={() => {
							setTimeout(() => props.setUser(new User()), 500);
						}}
					>
						<img src="GitHub-Mark-120px-plus.png"></img>
					</Button>
				</Container>
			</Block>
		</VStack>
	);
}
