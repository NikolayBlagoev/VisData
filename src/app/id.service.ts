import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdService {

  private readonly idLength = 12;

  private letters = "abcdefghijklmnopqrstuvwxyz".split("");

  generateId(): string {
    let id = "";
    for (let i = 0; i < this.idLength; i++) {
      id += this.letters[Math.round(Math.random() * 100) % 26];
    }
    return id;
  }
}
