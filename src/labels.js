// @flow

import type { Label, LabelInfo } from "./types";

const colours = [
  "#D55E00",
  "#0072B2",
  "#009E73",
  "#F0E442",
  "#56B4E9",
  "#CC79A7",
  "#999999",
  "#E69F00",
];

export function maxLabels() {
  return colours.length;
}

export function generateLabelInfo(labels: Label[]): { [string]: LabelInfo } {
  return labels.reduce(
    (memo, label, i) =>
      Object.assign(memo, {
        [label.id]: {
          id: label.id,
          initial: (sharesFirstLetter(labels, label)
            ? label.title.substr(0, 2)
            : label.title.substr(0, 1)).toUpperCase(),
          colour: colours[i % colours.length],
          title: label.title
        }
      }),
    {}
  );
}

function sharesFirstLetter(labels: Label[], label: Label) {
  const ch = label.title.substr(0, 1);
  return labels.some(l => l !== label && l.title.startsWith(ch));
}
