import {Injectable} from '@angular/core';
import {EntryTreeService} from "./entry-tree.service";

@Injectable({
  providedIn: 'root'
})

export class FetchService {

  constructor(private entryTree: EntryTreeService) {}

  async fetch(path: string) {
    const resp = await fetch(path);
    return JSON.parse(await resp.text());
  }

  async fetchFromTree(id: number) {
    const path = await this.entryTree.getEntryPath(id);
    return this.fetch(path);
  }
}
