// @flow

export const statusIds = ["validation", "ontrack", "atrisk", "intervention", "onhold"];
export type Status = "validation" | "ontrack" | "atrisk" | "intervention" | "onhold";

export const tabIds = ["edit"];
export type TabId = "edit";

export type Label = {
  +id: string,
  +title: string
};

export type LabelInfo = {
  id: string,
  initial: string,
  colour: string,
  title: string
};

export type Project = {
  id: string,
  title: string,
  person: string,
  tentative: boolean,
  time: string,
  progress: number,
  status: Status,
  labels: string[]
};
