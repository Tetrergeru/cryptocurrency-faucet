export interface Coin {
	readonly title: string;
	readonly color: string;
	readonly icon: string;
}

export class UndefiendCoin implements Coin {
	readonly title: string = 'Undefiend';
	readonly color: string = '#DEADBEEF';
	readonly icon: string = '';
}

export class EthereumCoin implements Coin {
	readonly title: string = 'Ethereum';
	readonly color: string = '#FFC700';
	readonly icon: string = 'Eth';
}

export class TerraCoin implements Coin {
	readonly title: string = 'Terra';
	readonly color: string = '#138843';
	readonly icon: string = 'Terra';
}
