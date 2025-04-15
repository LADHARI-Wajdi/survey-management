import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { SurveyStatus } from '../enums/survey-status.enum';
import { SurveyType } from '../enums/survey-type.enum';
import { IIdentifiable } from 'src/shared/types/interfaces/identifiable.interface';
import { IAnswerOption } from 'src/answer-options/types/interfaces/answer-option.interfaces';
import { IUser } from 'src/user/types/interfaces/user.interface';


export interface ISurvey extends IIdentifiable {
  title: string;
  description: string;
  status: SurveyStatus;
  type: SurveyType;
  startDate: Date;
  endDate: Date;
  createdBy: IUser | string;
  questions: IQuestion[] | string[];
  answerOptions: IAnswerOption[] | string[];
}
