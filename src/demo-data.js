// @flow

import type { Project, Label } from "./types";

export const projects: Project[] = [
  /*
  {
    id: "1",
    title: "Coffee Swirl",
    person: "Joe Lemon",
    time: "2017-03-15T10:54:04.445Z",
    progress: 13,
    status: "ontrack",
    labels: ["TMOL"]
  },
  {
    id: "2",
    title: "Rake Twister",
    person: "Alex Apple",
    time: "2017-04-12T10:54:04.445Z",
    progress: 50,
    tentative: true,
    status: "onhold",
    labels: ["TMOL", "Em"]
  }
  */
];

export const labels: Label[] = [
  {
    id: "TMOL",
    title: "TMOL"
  },
  {
    id: "Em",
    title: "Embedded"
  }
];
