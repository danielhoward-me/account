import {USER_AUTH_CODE_EXPIRES_MINUTES} from './../../../constants';
import email, {EmailTemplate} from './../../../server/email';
import {saveSession} from './../../../server/session/session';
import User from './../../../server/user';

import {NextResponse} from 'next/server';

import type {AccountDetailsApiResponse} from './../../types.d';
import type {NextRequest} from 'next/server';

interface RequestBody {
	username: string;
	email: string;
	password: string;
}

export async function POST(req: NextRequest) {
	const data = await req.json() as RequestBody;

	const usernameExists: boolean = await User.usernameExists(data.username);
	const emailExists: boolean = await User.emailExists(data.email);

	if (usernameExists || emailExists) {
		return NextResponse.json<AccountDetailsApiResponse>({
			successful: false,
			usernameExists,
			emailExists,
		});
	}

	const user = await User.create(data.username, data.email, data.password);
	await user.waitForLoad();

	email.sendTemplate(`${user.username} <${user.email}>`, EmailTemplate.ConfirmEmail, {
		username: user.username,
		expiryTime: USER_AUTH_CODE_EXPIRES_MINUTES,
		confirmCode: user.authCode,
	});

	saveSession(null, user.id);

	return NextResponse.json<AccountDetailsApiResponse>({
		successful: true,
	});
}
