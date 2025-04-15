import { ISurvey } from 'src/surveys/types/interfaces/survey.interface';
import { IResponse } from 'src/responses/types/interfaces/response.interface';
import { QuestionType } from '../enums/question-type.enum';
import { IAnswerOption } from 'src/answer-options/types/interfaces/answer-option.interfaces';
import { IIdentifiable } from 'src/shared/types/interfaces/identifiable.interface';

export interface IQuestion extends IIdentifiable {
  text: string;
  type: QuestionType;
  isRequired: boolean;
  survey: ISurvey | string;
  responses: IResponse[] | string[];
  answerOptions: IAnswerOption[] | string[];
}
