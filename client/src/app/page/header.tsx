import {
	Container,
	Heading,
	HStack,
	Ldo,
	Text,
	VStack,
} from '@lidofinance/lido-ui';
import User from '../User';

function Logo() {
	return <Heading>Crypto loot</Heading>;
}

function Username() {
	return (
		<HStack>
			<Text size="md" style={{ padding: '10px' }}>
				Sign out
			</Text>
			<Ldo />
		</HStack>
	);
}

export default function Header(props: { user: User }) {
	const { user } = props;
	return (
		<VStack as="header" align="center">
			<HStack
				align="center"
				justify="space-between"
				style={{
					width: '100%',
					maxWidth: '1040px',
					height: '100px',
				}}
			>
				<Logo />
				<Username />
			</HStack>
		</VStack>
	);
}
