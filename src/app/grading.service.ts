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

  private likeGenreDistribution?: Record<string, Distribution>;
  private likeRecentGenreDistribution?: Record<string, Distribution>;
  private playtimeGenreDistribution?: Record<string, Record<string, Distribution>>;
  private ownersGenreDistribution?: Record<string, Distribution>;

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

    this.fetchService.fetch("assets/aggregate/likes_genres.json").then(res => {
      this.likeGenreDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/like_genre_30_days.json").then(res => {
      this.likeRecentGenreDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/steamspy_static_per_genre.json").then(res => {
      this.playtimeGenreDistribution = res;
    });

    this.fetchService.fetch("assets/aggregate/owners_per_genre.json").then(res => {
      this.ownersGenreDistribution = res;
    });
  }

  private getDistribution(metric: PopMetric, genre?: string): [Distribution, number] {
    if (!genre) {
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
    else {
      switch (metric) {

        case PopMetric.Likes:
          return [this.likeGenreDistribution![genre], 2];
        case PopMetric.LikesRecent:
          return [this.likeRecentGenreDistribution![genre], 2];
        case PopMetric.Playtime:
          return [this.playtimeGenreDistribution![genre]["avg_forever"], 0.1];
        case PopMetric.PlaytimeRecent:
          return [this.playtimeGenreDistribution![genre]["avg_2_weeks"], 0.1];
        case PopMetric.Owners:
          return [this.ownersGenreDistribution![genre], 0.1];
      }
    }
  }

  private calcGrade(amount: number, distribution: Distribution, exp: number) {
    return 10 * ((amount - distribution.min) / (distribution.max - distribution.min)) ** exp;
  }

  numberToGrade(amount: number, metric: PopMetric, genre?: string): number {
    const [distribution, exp] = this.getDistribution(metric, genre);

    return this.calcGrade(amount, distribution, exp);
  }

  attributeToGrade(attr: string, metric: PopMetric, genre?: string): number {
    const [distribution, exp] = this.getDistribution(metric, genre);

    return this.calcGrade(distribution[attr], distribution, exp);
  }

  attributeUngraded(attr: string, metric: PopMetric, genre?: string): number {
    return this.getDistribution(metric, genre)[0][attr];
  }
}
