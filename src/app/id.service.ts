import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdService {

  private ids: string[];
  private letters = "abcdefghijklmnopqrstuvwxyz".split("");

  constructor() {
    this.ids = [];
  }

  generateId(): string {
    let id = "";
    for (let i = 0; i < 10; i++) {
      id += this.letters[Math.round(Math.random() * 10)];
    }

    if (this.ids.includes(id)) {
      return this.generateId();
    } else {
      this.ids.push(id);
      return id;
    }
  }
}
