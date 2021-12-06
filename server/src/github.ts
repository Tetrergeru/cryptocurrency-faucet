import http from 'https';

function fetchJSON<T = unknown>(
	url: string,
	options: http.RequestOptions
): Promise<T> {
	return new Promise((resolve, reject) => {
		http
			.get(url, options, res => {
				const { statusCode } = res;
				const contentType = res.headers['content-type'];
				let errorMsg: string | null = null;
				// Any 2xx status code signals a successful response but
				// here we're only checking for 200.
				if (statusCode !== 200) {
					errorMsg = 'Request Failed.\n' + `Status Code: ${statusCode}`;
				} else if (!/^application\/json/.test(contentType || '')) {
					res.resume();
					return reject(
						new Error(
							'Invalid content-type.\n' +
								`Expected application/json but received ${contentType}`
						)
					);
				}
				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', chunk => {
					rawData += chunk;
				});
				res.on('end', () => {
					try {
						const parsedData = JSON.parse(rawData);
						if (errorMsg) return reject(new Error(`${errorMsg}: ${rawData}`));
						return resolve(parsedData);
					} catch (e) {
						return reject(
							new Error(`${errorMsg}: ${e instanceof Error ? e.message : e}`)
						);
					}
				});
			})
			.on('error', reject);
	});
}

function fetchAPIGitHub<T = unknown>(
	url: string,
	accessToken: string
): Promise<T> {
	return fetchJSON<T>(url, {
		headers: {
			Authorization: `token ${accessToken}`,
			Accept: 'application/vnd.github.v3.raw+json',
			'User-Agent': 'crypto-loot',
		},
	});
}

export function userGroups(
	nickname: string,
	accessToken: string
): Promise<string[]> {
	return fetchAPIGitHub<{ login: string }[]>(
		`https://api.github.com/users/${nickname}/orgs`,
		accessToken
	).then(orgs => orgs.map(o => o.login));
}
