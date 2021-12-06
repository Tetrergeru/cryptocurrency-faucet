import { Error, Loader, Success } from '@lidofinance/lido-ui';

export enum Status {
	Success,
	Pending,
	Error,
}

export type statusMessage = {
	status: Status;
	message: string;
};

export function StatusIcon(props: { status: Status }) {
	switch (props.status) {
		case Status.Error:
			return <Error color="red" height={64} width={64} />;
		case Status.Pending:
			return <Loader size="large" />;
		case Status.Success:
			return <Success color="green" height={64} width={64} />;
	}
}
