import { IsUrl } from 'class-validator';

export class UrlDto {
  @IsUrl()
  originalUrl: string;
}
