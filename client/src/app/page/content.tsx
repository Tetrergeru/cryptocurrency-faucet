import { Container } from '@lidofinance/container';
import Form from './form';
import { ServerProvider } from './serverContext';

export default function Content() {
	return (
		<ServerProvider>
			<Container as="main" size="full">
				<Form></Form>
			</Container>
		</ServerProvider>
	);
}
