/* eslint-disable prettier/prettier */
import { IIdentifiable } from "src/shared/types/interfaces/identifiable.interface";


export interface IAnalytics extends IIdentifiable {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  questionStats: string;
  demographicData:string;
  averageCompletionTime: number;
}
