import { Container } from '@lidofinance/lido-ui';
import Content from './content';
import Footer from './footer';
import Header from './header';
import { ServerProvider } from './serverContext';

export default function Page() {
	return (
		<Container
			size="full"
			style={{
				maxWidth: '100%',
				height: '100%',
			}}
		>
			<Header></Header>
			<Content></Content>
			<Footer></Footer>
		</Container>
	);
}
