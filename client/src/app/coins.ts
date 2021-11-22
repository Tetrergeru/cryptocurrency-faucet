export interface Coin {
	readonly title: string;
	readonly color: string;
	readonly icon: string;
}

export class EtheriumCoin implements Coin {
	readonly title: string = 'Etherium';
	readonly color: string = '#FFC700';
	readonly icon: string = 'Eth';
}

export class TerraCoin implements Coin {
	readonly title: string = 'Terra';
	readonly color: string = '#138843';
	readonly icon: string = 'Terra';
}
