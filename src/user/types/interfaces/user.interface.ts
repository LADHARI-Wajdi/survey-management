import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';
import { IResponse } from 'src/responses/types/interfaces/response.interface';
import { UserRole } from '../enums/user-role.enum';
import { IIdentifiable } from 'src/shared/types/interfaces/identifiable.interface';

export interface IUser extends IIdentifiable {
  username: string;
  password: string;
  email: string;
  role: UserRole;
  admin: boolean;
  surveys: ISurvey[] | string[];
  responses: IResponse[] | string[];
}
