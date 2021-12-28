import { Response, Router } from 'express';
import passport from 'passport';
import passportGithub from 'passport-github2';
import config from './config';
import * as GithubAPI from './github';
import Users, { User } from './users';

passport.use(
	new passportGithub.Strategy(
		config.auth.github,
		(accessToken, refreshToken, results, profile, verified) => {
			const {
				id,
				username,
				photos: [{ value: avatarUrl }],
			} = profile;
			GithubAPI.userGroups(username, accessToken)
				.then(organizations => {
					const userFields = {
						name: username,
						avatarUrl,
						githubId: id,
						organizations,
						accessToken,
					};
					Users.findOneAndUpdate(
						{ name: username },
						userFields,
						{ upsert: true },
						(err, user) => verified(err, user ? user : undefined)
					);
				})
				.catch(err => verified(err));
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, (user as User).id);
});

passport.deserializeUser((userId, done) => {
	Users.findById(userId)
		.exec()
		.then(user => done(null, user))
		.catch(done);
});

const authRouter = Router();
authRouter.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/');
});

authRouter.get(
	'/github',
	passport.authenticate('github', { scope: ['read:org'] })
);
authRouter.get(
	'/github/callback',
	passport.authenticate('github', {
		failureRedirect: '/login',
		successRedirect: '/',
	})
);

export default authRouter;

export function authCheckMiddleware(req: any, res: Response, next: any) {
	// TODO: types
	if (req.isUnauthenticated())
		return res
			.status(401)
			.json({ message: 'Login with github and enable cookies.' });
	if (
		!config.auth.github.organizations.some(org => (req.user as User)?.organizations.includes(org))
	) {
		return res
			.status(403)
			.json({
				message:
					`You should be in the GitHub organization (${config.auth.github.organizations.join(",")}). If you has been added, try logout and login again.`,
			});
	}
	next();
}
