import {Injectable} from '@angular/core';

type TreeEntry = {
  smallest: number;
  largest: number;
  children: TreeEntry[];
}

@Injectable({
  providedIn: 'root'
})

export class EntryTreeService {

  async getEntryPath(id: number) {
    const res = await fetch("assets/tree.json");
    const value = await  res.text();
    let tree: TreeEntry = JSON.parse(value);

    const path = ["assets", "entries"];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      path.push(tree.smallest + "-" + tree.largest);

      if (tree.children.length == 0)
        break;

      for (const child of tree.children) {
        if (child.smallest <= id && child.largest >= id) {

          tree = child;
          break;
        }
      }
    }

    path.push(id + ".json");

    return "http://localhost:6900/" + path.join("/");
  }
}
