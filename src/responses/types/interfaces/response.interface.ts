import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { IIdentifiable } from 'src/shared/types/interfaces/identifiable.interface';
import { IUser } from 'src/user/types/interfaces/user.interface';

// Option 1: Omettre updatedAt de l'héritage IIdentifiable
export interface IResponse extends Omit<IIdentifiable, 'updatedAt'> {
  answer: string;
  question: IQuestion | string;
  user: IUser | string | null;
}
