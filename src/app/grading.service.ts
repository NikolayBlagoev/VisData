import {Injectable} from '@angular/core';
import {Distribution, PopMetric} from "./data-types";
import {FetchService} from "./fetch.service";

@Injectable({
  providedIn: 'root'
})
export class GradingService {

  private likeDistribution?: Distribution;
  private likeRecentDistribution?: Distribution;
  private playtimeDistribution?: Record<string, Distribution>;
  private ownersDistribution?: Distribution;

  constructor(private fetchService: FetchService) {
    this.fetchService.fetch("assets/aggregate/total_likes.json").then(res => {
      this.likeDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/30_days_likes.json").then(res => {
      this.likeRecentDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/steamspy_static.json").then(res => {
      this.playtimeDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/owners_aggregate.json").then(res => {
      this.ownersDistribution = res;
    });
  }

  private getDistribution(metric: PopMetric): [Distribution, number] {
    switch (metric) {

      case PopMetric.Likes:
        return [this.likeDistribution!, 2];
      case PopMetric.LikesRecent:
        return [this.likeRecentDistribution!, 2];
      case PopMetric.Playtime:
        return [this.playtimeDistribution!["avg_forever"], 0.1];
      case PopMetric.PlaytimeRecent:
        return [this.playtimeDistribution!["avg_2_weeks"], 0.1];
      case PopMetric.Owners:
        return [this.ownersDistribution!, 0.1];
    }
  }

  numberToGrade(amount: number, metric: PopMetric): number {
    const [distribution, exp] = this.getDistribution(metric)!;

    return 10 * ((amount - distribution.min) / (distribution.max - distribution.min)) ** exp;
  }

  attributeToGrade(attr: string, metric: PopMetric): number {
    const [distribution] = this.getDistribution(metric)!;

    return this.numberToGrade(distribution[attr], metric);
  }
}
