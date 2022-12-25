import {Injectable} from '@angular/core';
import {Distribution, PopMetric} from "./data-types";
import {FetchService} from "./fetch.service";

@Injectable({
  providedIn: 'root'
})
export class GradingService {

  private ownerMap?: Record<string, number>;
  private playtimeDistribution?: Record<string, Distribution>;
  private ownersDistribution?: Distribution;

  constructor(private fetchService: FetchService) {
    this.fetchService.fetch("assets/aggregate/unique_owners.json").then(res => {
      this.ownerMap = res;
    });

    this.fetchService.fetch("assets/aggregate/steamspy_static.json").then(res => {
      this.playtimeDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/owners_aggregate.json").then(res => {
      this.ownersDistribution = res;
    });
  }

  // ownersToGrade(amount: number, ownerMap?: Record<string, number>): number {
  //   if (!ownerMap)
  //     ownerMap = this.ownerMap;
  //
  //   return this.numberToGrade(amount, ownerMap!);
  // }

  private getDistribution(metric: PopMetric): Distribution | undefined {
    switch (metric) {

      case PopMetric.Likes:
        return;
      case PopMetric.LikesRecent:
        return;

      case PopMetric.Playtime:
        return this.playtimeDistribution!["avg_forever"];
      case PopMetric.PlaytimeRecent:
        return this.playtimeDistribution!["avg_2_weeks"];
      case PopMetric.Owners:
        return this.ownersDistribution!;

      default:
        return;
    }
  }

  numberToGrade(amount: number, metric: PopMetric, distribution?: Distribution): number {
    if (!distribution) {
      distribution = this.getDistribution(metric)!;
    }

    return 10 * ((amount - distribution.min) / (distribution.max - distribution.min)) ** 0.25;
  }

  attributeToGrade(attr: string, metric: PopMetric, distribution?: Distribution): number {
    if (!distribution) {
      distribution = this.getDistribution(metric)!;
    }

    return this.numberToGrade(distribution[attr], metric);
  }

  // numberToGrade(amount: number, gradeMap: Record<string, number>) {
  //   for (const [key, value] of Object.entries(gradeMap)) {
  //     const [min, max] = key.split(" .. ");
  //     const minInt = parseInt(min.replaceAll(",", ""));
  //     const maxInt = parseInt(max.replaceAll(",", ""));
  //
  //     if (amount >= minInt && amount < maxInt) {
  //       return value;
  //     }
  //   }
  //   return 0;
  // }
}
