import { Container } from '@lidofinance/lido-ui';
import User from '../User';
import Content from './content';
import Footer from './footer';
import Header from './header';

export default function Page(props: { user: User }) {
	const { user } = props;
	return (
		<Container
			size="full"
			style={{
				maxWidth: '100%',
				height: '100%',
			}}
		>
			<Header user={user}></Header>
			<Content></Content>
			<Footer></Footer>
		</Container>
	);
}
