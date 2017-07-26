// @flow

import moment from "moment";
import { combineReducers } from "redux";
import type { Action } from "../actions";
import { projects as demoProjects, labels as demoLabels } from "../demo-data";
import { generateLabelInfo } from "../labels";
import type { Label, Project, LabelInfo, TabId } from "../types";
import assert from 'assert';

export type { Label, Project };

export type State = {
  +title: ?string,
  +selectedTab: ?TabId,
    +projects: Project[],
      +labels: Label[],
        +errorMessage: ?(string | string[]),
          +publishDate: number
};

const reducer = combineReducers({
  title,
  selectedTab,
  projects,
  labels,
  errorMessage,
  publishDate
});
export default reducer;

function title(title: ?string = null, action: Action): ?string {
  if (action.type === "LOAD_DEMO_DATA") return "TracMap Roadmap - Completion Estimates";
  else return title;
}
function selectedTab(selectedTab: ?TabId = null, action: Action): ?TabId {
  if (action.type === "SELECT_TAB") return action.tabId;
  return selectedTab;
}

function projects(projects: Project[] = [], action: Action): Project[] {
  switch (action.type) {

    case "LOAD_ALL_DATA":
      return action.data.projects;

    case "LOAD_DEMO_DATA":
      return demoProjects;

    case "LOAD_PROJECT":
      return [...projects, action.project];

    case "UPDATE_PROJECT":
      const project = action.project;
      const index = projects.findIndex(({ id }) => id === project.id);
      if (index === -1) return projects;
      else
        return [
          ...projects.slice(0, index),
          action.project,
          ...projects.slice(index + 1)
        ];

    default:
      return projects;
  }
}

function labels(labels: Label[] = [], action: Action): Label[] {
  switch (action.type) {
    case "LOAD_ALL_DATA":
      return action.data.labels;
    case "LOAD_DEMO_DATA":
      return demoLabels;
    case "LOAD_LABEL":
      return [...labels, action.label];
    default:
      return labels;
  }
}

function errorMessage(
  errorMessage: ?(string | string[]) = null,
    action: Action
): ?(string | string[]) {
  return errorMessage;
}

function publishDate(date: number = NaN, action: Action) {
  switch (action.type) {
    case "LOAD_ALL_DATA":
      return action.data.publishDate || NaN;
    default:
      return date;
  }
}

export function getTitle(state: State): ?string {
  return state.title;
}

export function getProject(state: State, id: string): ?Project {
  return state.projects.find(project => project.id === id);
}

export function getUsedLabels(state: State): string[] {
  const allLabelIds = state.projects.reduce(
    (memo, project) => [...memo, ...project.labels],
    ([]: string[])
  );
  return state.labels
    .filter(label => allLabelIds.indexOf(label.id) !== -1)
    .map(label => label.id);
}

export function getLabelInfo(state: State, id: string): LabelInfo {
  return generateLabelInfo(state.labels)[id];
}

function getProjectIdsByMonthAndYear(
  state: State,
  year: number
): { month: string, projectIds: string[] }[] {
  const monthIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return monthIndexes
    .map(monthIndex =>
      state.projects.filter(
        project => {
          return moment(project.time).month() === monthIndex && moment(project.time).year() === year;
        }
      )
    )
    .filter(month => month.length > 0)
    .map(month => ({
      month: moment(month[0].time).format("MMMM"),
      projectIds: month.map(project => project.id)
    }));
}

export function getProjectIdsByMonth(
  state: State
): { year: number, data: { month: string, projectIds: string[] }[] }[] {
  const earliestYear = state.projects.reduce((memo, project) => Math.min(memo, moment(project.time).year()), 9999);
  const latestYear = state.projects.reduce((memo, project) => Math.max(memo, moment(project.time).year()), -9999);

  if (state.projects.length > 0) {
    assert(latestYear - earliestYear >= 0);
  }

  if (latestYear - earliestYear > 100) {
    // This should be in the validator.
    alert("Roadmap spans more than 100 years. Have you made a typo with a date?");
  }

  var years = []
  for (var i = earliestYear; i <= latestYear; i++) {
    years.push(i);
  }

  years = years.map(year => ({ year, data: getProjectIdsByMonthAndYear(state, year) }));

  return years;
}

export function getErrorMessage(state: State): ?(string | string[]) {
  return state.errorMessage;
}

export function getSelectedTab(state: State): ?TabId {
  return state.selectedTab;
}

export function getPublishDate(state: State): ?string {
  return state.publishDate
    ? new moment(state.publishDate).format("Do MMMM YYYY")
    : null;
}

export function getEditable(state: State): boolean {
  return state.selectedTab === "edit";
}
