import mongoose from 'mongoose';

interface UserModel {
	name: string;
	githubId: string;
	avatarUrl: string;
	organizations: string[];
	accessToken: string;
}

export type User = mongoose.Document<unknown, unknown, UserModel> &
	UserModel & {
		_id: mongoose.Types.ObjectId;
	};

const userSchema = new mongoose.Schema<UserModel>({
	name: { type: String, required: true },
	githubId: { type: String, required: true },
	avatarUrl: { type: String, required: true },
	organizations: { type: [String], required: true },
	accessToken: { type: String, required: true },
});

export default mongoose.model('users', userSchema);
