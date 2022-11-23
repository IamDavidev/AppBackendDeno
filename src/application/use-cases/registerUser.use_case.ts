import UserModel from '@domain/models/user.model.ts';
import { inject, injectable } from '@shared/packages/npm/inversify.package.ts';

import { UserEmailIsAlreadyInUseException } from '@application/errors/userEmailIsAlreadyInUse.exception.ts';
import { UserIdIsAlreadyInUseException } from '@application/errors/userIdIsAlreadyInUse.exception.ts';
import { UserTagNameIsAlreadyInUseException } from '@application/errors/userTagNameIsAlreadyInUse.exception.ts';

import UserRepository from '@infrastructure/repositories/userRepository.ts';
import { type IUserRepository } from '@infrastructure/interfaces/UserRepository.interface.ts';
import { repositoriesSymbols } from '@infrastructure/interfaces/repositories.symbol.ts';
import { type UserRegister } from '../interfacs/UserRegister.interface.ts';

@injectable()
export class UserRgisterUseCase {
	private _userRepository: IUserRepository;
	constructor(
		@inject(repositoriesSymbols.userRepository) userRepository: IUserRepository
	) {
		this._userRepository = userRepository;
	}

	async execute({
		bio,
		email,
		name,
		numberOfPublications,
		password,
		profileImage,
		publications,
		tagName,
		uuid,
	}: UserRegister): Promise<void> {
		const newUserModel = await UserModel.createUser({
			bio,
			email,
			name,
			numberOfPublications,
			password,
			profileImage,
			publications,
			tagName,
			uuid,
		});

		const existUserByUUid = await this._userRepository.findByUUId({
			userUUId: newUserModel.uuid,
		});
		if (existUserByUUid === null) throw new UserIdIsAlreadyInUseException();

		const existUserByEmail = await this._userRepository.findByEmail({
			userEmail: newUserModel.email,
		});
		if (existUserByEmail === null) throw new UserEmailIsAlreadyInUseException();

		const existUserByTagName = await this._userRepository.findByTagName({
			userTagName: newUserModel.tagName,
		});
		if (existUserByTagName === null)
			throw new UserTagNameIsAlreadyInUseException();

		await this._userRepository.create({
			user: newUserModel,
		});
	}
}
