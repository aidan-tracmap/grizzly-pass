// @flow

import flow from "lodash/flow";
import isArray from "lodash/isArray";
import isPlainObject from "lodash/isPlainObject";
import uniqBy from "lodash/uniqBy";
import uniqueId from "lodash/uniqueId";
import moment from "moment";
import type { Result } from "./result";
import { ok, err, mapErr, map, andThen, fromList } from "./result";
import type { Project, Label, Status } from "./types";
import { statusIds } from "./types";

type ImportProject = {
  title: string,
  person: string,
  date: string,
  progress: number,
  health: Status,
  tags: string[]
};

type Output = {
  title: ?string,
  publishDate: ?number,
  projects: Project[],
  labels: Label[]
};

export function importFile(
  fileContents: string,
  publishDate: ?number
): Result<Output, string | string[]> {
  const result = flow(
    parseFile,
    mapErr(e => `File ${e}`),
    andThen(
      flow(
        data => data.map(validateProject),
        fromList,
        mapErr(badProjects =>
          badProjects.map((badProject, i) => `Project ${i + 1} ${badProject}`)
        )
      )
    ),
    map(projects => [projects, generateLabels(projects)]),
    map(([projects, labels]) => ({
      title: null,
      publishDate: publishDate || null,
      projects: projects.map(project => {
        const { title, person, health, progress, tentative, date, tags = [] } = project;
        return {
          id: uniqueId(),
          title,
          person,
          status: health,
          progress,
          tentative,
          time: moment(date, "YYYY-MM-DD").format(),
          labels: findLabelIds(labels, tags)
        };
      }),
      labels
    }))
  )(fileContents);

  return result;
}

export function validateProject(project: any): Result<ImportProject, string> {
  if (!isPlainObject(project)) return err("is not a JSON object");
  if (typeof project.title !== "string")
    return err("has an invalid/missing title field");
  if (typeof project.person !== "string")
    return err("has an invalid/missing person field");
  if (!statusIds.includes(project.health))
    return err(
      `has an invalid/missing health field, it must be one of: ${statusIds.join(", ")}`
    );
  if (
    typeof project.date !== "string" ||
    !/^\d\d\d\d-\d\d-\d\d$/.test(project.date)
  )
    return err(
      "has an invalid/missing date field, it must be in the YYYY-MM-DD format"
    );
  if (
    typeof project.progress !== "number" ||
    project.progress < 0 ||
    project.progress > 100
  )
    return err("has an invalid/missing, it must be a number between 0 and 100");
  if (
    project.tags !== undefined &&
    (!isArray(project.tags) || project.tags.some(t => typeof t !== "string"))
  )
    return err("has an invalid tags list, it must be an array of strings");

  return ok(project);
}

function parseFile(fileContents: string): Result<any[], string> {
  try {
    const asObj = JSON.parse(fileContents);
    return isArray(asObj) ? ok(asObj) : err("isn't a JSON array");
  } catch (e) {
    return err("is not valid JSON ... " + e);
  }
}

function generateLabels(projects: ImportProject[]): Label[] {
  return uniqBy(
    projects
      .reduce((memo, { tags = [] }) => [...memo, ...tags], [])
      .map(label => ({ title: label, id: uniqueId() })),
    "title"
  );
}

function findLabelIds(labels, projectTags) {
  return projectTags.map(tag => labels.find(l => l.title === tag).id);
}
