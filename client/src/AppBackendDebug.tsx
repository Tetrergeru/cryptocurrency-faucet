import React, { useEffect, useState } from 'react';
import './App.css';

function log<T>(w: T): T {
	console.log(w);
	return w;
}

function AppBackendDebug() {
	const [wallets, updateWallets] = useState<string | undefined>();
	const [loading, updateLoading] = useState<
		Record<string, boolean | undefined>
	>({});
	const [limits, updateLimits] = useState<Record<string, number>[]>([{}]);
	const [userWallet, updateUserWallet] = useState('');
	const [logs, updateLogs] = useState('');

	const fetchList = () => {
		fetch('api/wallets/')
			.then(x => x.json())
			.then(x => {
				updateWallets(log(JSON.stringify(x, undefined, '  ')));
			})
			.catch(e => updateLogs(log('ERROR: ' + e)));

		fetch('api/limits/')
			.then(x => x.json())
			.then(x => updateLimits(log(x)))
			.catch(e => updateLogs(log('ERROR: ' + e)));
	};
	useEffect(fetchList, []);
	return (
		<div className="App">
			<header className="App-header">
				<section>
					<input
						placeholder="Input your wallet"
						onChange={ev => updateUserWallet(ev.target.value)}
						value={userWallet}
						style={{ width: '450px' }}
					/>
					<button onClick={fetchList}>Fetch wallets</button>
				</section>
				{!wallets ? (
					<div />
				) : (
					(JSON.parse(wallets) as any[]).map(x => (
						<article key={x.name} style={{ display: 'flex', width: '600px' }}>
							<header style={{ flex: '2' }}>{x.name}</header>
							<section style={{ margin: '0px 10px', flex: '1' }}>
								{x.balance}
							</section>
							{[1, 10, 25, 26].map(moneyCount => (
								<button
									key={moneyCount}
									disabled={loading[x.name] || userWallet === ''}
									onClick={() => {
										updateLoading({ [x.name]: true });
										updateLogs('TRANSFERING');
										fetch(`/api/wallets/${x.id}/transfer`, {
											method: 'POST',
											body: JSON.stringify({
												targetWallet: userWallet,
												moneyCount,
											}),
											headers: {
												'Content-Type': 'application/json',
											},
										}).then(resp => {
											resp.text().then(updateLogs);
											fetchList();
											updateLoading({ [x.name]: false });
										});
									}}
								>
									-{moneyCount}
								</button>
							))}
							<section style={{ flex: '1' }}>
								Limit: {limits[0][x.name]}
							</section>
						</article>
					))
				)}
				<footer>{logs}</footer>
			</header>
		</div>
	);
}

export default AppBackendDebug;
