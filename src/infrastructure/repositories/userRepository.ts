import { prisma } from '@infrastructure/clients/prisma.client.ts';
import { type PrismaClient, type User } from '@prisma/index.d.ts';

import UserModel from '@domain/models/user.model.ts';

import { type FindUserByCriteria } from '@infrastructure/interfaces/FindUserByCriteria.type.ts';
import { type IUserRepository } from '@infrastructure/interfaces/UserRepository.interface.ts';

import { UserRegister } from '@application/interfacs/UserRegister.interface.ts';
import { injectable } from '@shared/packages/npm/inversify.package.ts';
import { BioVo } from '../../domain/value_objects/bio.vo.ts';
import { EmailVo } from '../../domain/value_objects/email.vo.ts';
import { NameVo } from '../../domain/value_objects/name.vo.ts';
import { PasswordVo } from '../../domain/value_objects/password.vo.ts';
import { TagNameVo } from '../../domain/value_objects/tagName.vo.ts';
import { UUidVo } from '../../domain/value_objects/uuid.vo.ts';
import { IUserEntity } from '../../shared/interface/User.interface.ts';

export type IOrmUserDB = User;
// type FindUserModel = UserModel | null;

@injectable()
export default class UserRepository implements IUserRepository {
	private _orm: PrismaClient;

	constructor() {
		this._orm = prisma;
	}

	protected adapterUserToDomain(ormUser: IOrmUserDB): UserModel {
		const {
			uuid,
			name,
			email,
			password,
			tagName,
			bio,
			profileImage,
			numberOfPublications,
			publications,
		} = ormUser;

		return new UserModel(
			new UUidVo(uuid),
			new NameVo(name),
			new EmailVo(email),
			new PasswordVo(password),
			new TagNameVo(tagName),
			new BioVo(bio || ''),
			profileImage,
			numberOfPublications,
			publications
		);
	}

	protected adapterToOrm(userDomain: IUserEntity): UserRegister {
		const {
			uuid,
			bio,
			email,
			name,
			numberOfPublications,
			password,
			profileImage,
			publications,
			tagName,
		} = userDomain;

		return {
			bio: bio ? bio._value : '',
			email: email._value,
			name: name._value,
			numberOfPublications,
			password: password._value,
			profileImage: profileImage ? profileImage : '',
			tagName: tagName._value,
			uuid: uuid._value,
			publications,
		};
	}

	public async create({ user }: { user: UserModel }): Promise<void> {
		const {
			uuid,
			bio,
			email,
			name,
			numberOfPublications,
			password,
			profileImage,
			publications,
			tagName,
		} = user;

		await this._orm.user.create({
			data: {
				bio: bio ? bio._value : '',
				email: email._value,
				name: name._value,
				numberOfPublications,
				password: password._value,
				profileImage: profileImage ? profileImage : '',
				tagName: tagName._value,
				uuid: uuid._value,
				publications,
			},
		});
	}

	public async findByTagName({
		userTagName,
	}: {
		userTagName: TagNameVo;
	}): FindUserByCriteria {
		const userFound = await this._orm.user.findUnique({
			where: {
				tagName: userTagName._value,
			},
		});

		if (!userFound) return null;

		return this.adapterUserToDomain(userFound);
	}

	public async findByUUId({
		userUUId,
	}: {
		userUUId: UUidVo;
	}): FindUserByCriteria {
		const userFound = await this._orm.user.findUnique({
			where: {
				uuid: userUUId._value,
			},
		});
		console.log(userFound);
		if (!userFound) return null;

		return this.adapterUserToDomain(userFound);
	}

	public async findByEmail({
		userEmail,
	}: {
		userEmail: EmailVo;
	}): FindUserByCriteria {
		const userFound = await this._orm.user.findUnique({
			where: {
				email: userEmail._value,
			},
		});
		if (!userFound) return null;

		return this.adapterUserToDomain(userFound);
	}
}
