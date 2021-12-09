import {
	Dark,
	Heading,
	HStack,
	Ldo,
	Light,
	StackItem,
	Text,
	VStack,
} from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { useGlobalContext } from '../globalContext';
import { useUserApi } from './serverContext';
import { Status } from './statusMessage';

function Logo() {
	return <Heading>Crypto loot</Heading>;
}

const Image = styled.img`
	width: 32px;
	height: 32px;
	border-radius: 16px;
`;

const SignOutText = styled(Text)`
	&:hover {
		color: #aaaaaa;
	}
`;

function Username() {
	const user = useUserApi();
	const globalContext = useGlobalContext();
	const theme = globalContext.content.theme;

	return (
		<HStack align="center" justify="center" spacing="md">
			<StackItem>
				<a href="/api/auth/logout">
					<SignOutText size="md" style={{ padding: '10px' }}>
						Sign out
					</SignOutText>
				</a>
			</StackItem>
			<StackItem>
				{user.status.status === Status.Success ? (
					<Image src={user.data.avatarUrl} />
				) : (
					<Ldo />
				)}
			</StackItem>
			<StackItem
				onClick={() =>
					globalContext.setTheme(theme === 'dark' ? 'light' : 'dark')
				}
			>
				{theme === 'dark' ? <Light /> : <Dark />}
			</StackItem>
		</HStack>
	);
}

export default function Header() {
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
