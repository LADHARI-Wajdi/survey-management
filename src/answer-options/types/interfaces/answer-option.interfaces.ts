import { IQuestion } from 'src/questions/types/interfaces/question.interface';
import { IIdentifiable } from 'src/shared/types/interfaces/identifiable.interface';
import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';

export interface IAnswerOption extends IIdentifiable {
  value: string;
  question: IQuestion | string;
  survey: ISurvey | string;
}
