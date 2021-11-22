import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
	res.send('Hello crypto-hyena!');
});

app.listen(port, () => {
	console.log(`server is listening on ${port}`);
});
