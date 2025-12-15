import { Injectable } from '@nestjs/common';

@Injectable()
export class CarQueryService {
  private readonly CARQUERY_API = 'https://www.carqueryapi.com/api/0.3';

  async getMakes(year: string) {
    try {
      const response = await fetch(
        `${this.CARQUERY_API}/?cmd=getMakes&year=${year}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API error:', error);
      return { Makes: [] };
    }
  }

  async getModels(year: string, make: string) {
    try {
      const response = await fetch(
        `${this.CARQUERY_API}/?cmd=getModels&make=${encodeURIComponent(make)}&year=${year}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API error:', error);
      return { Models: [] };
    }
  }

  async getTrims(year: string, make: string, model: string) {
    try {
      const response = await fetch(
        `${this.CARQUERY_API}/?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CarQuery API error:', error);
      return { Trims: [] };
    }
  }
}
