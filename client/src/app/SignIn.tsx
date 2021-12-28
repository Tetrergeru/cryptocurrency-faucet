import {
	Button,
	Block,
	Container,
	VStack,
	Heading,
	Text
} from '@lidofinance/lido-ui';
import { useUserApi } from './page/serverContext';

export default function SignIn() {
	const user = useUserApi();
	const status = user.status.message;

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
					<a href="/api/auth/github">
						<Button
							style={{
								backgroundColor: 'white',
							}}
						>
							<img src="GitHub-Mark-120px-plus.png"></img>
						</Button>
					</a>
				</Container>
					{ status ? <Text>{status} </Text> : undefined }
			</Block>
		</VStack>
	);
}
