// @flow

import { flow } from "lodash";
import React from "react";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import { loadProjectJsonSuccess, loadProjectJsonFailure, loadAllData } from "../../actions";
import { importFile } from "../../import";
import type { State } from "../../reducer";
import { getProjectIdsByMonth } from "../../reducer";
import { map, mapErr, isOk } from "../../result";
import type { TabId } from "../../types";
import Card from "../Card";
import Header from "../Header";
import Legend from "../Legend";
import SideMenu from "../SideMenu";
import "./App.css";

const importProject = (
  readFileAsText: (File) => Promise<string>,
  file: File
) => async (dispatch: Dispatch<*>) => {
  const asText = await readFileAsText(file);
  flow(
    importFile,
    map(fileData => dispatch(loadProjectJsonSuccess(fileData))),
    mapErr(errorMessage => dispatch(loadProjectJsonFailure(errorMessage)))
  )(asText);
};

type AppProps = {
  projectsByMonth: { month: string, projectIds: string[] }[],
  errorMessage: ?(string | string[]),
  selectedTab: ?TabId,
  importFile: (File) => void,
  loadData: (Object) => void
};

export function AppPresentation({
  projectsByMonth,
  errorMessage,
  selectedTab,
  importFile,
  loadData
}: AppProps) {
  const months = projectsByMonth.map(({ month, projectIds }) => {
    const cards = projectIds.map(projectId => (
      <div className="App-cardWrapper" key={projectId}>
        <Card projectId={projectId} />
      </div>
    ));
    return (
      <div key={month} className="App-month">
        <h2 className="App-monthTitle">{month}</h2>
        {cards}
      </div>
    );
  });

  const hasProjects = !!projectsByMonth.length;

  //const loadData = this.props.loadDataIntoStore

  const appContent = errorMessage != null ?
    formatErrors(errorMessage) :
    (months.length ?
      months :
      "Drop a roadmap JSON file here."
    );

  return (
    <div
      className="App"
      onDrop={e => handleDrop(importFile, e, loadData)}
      onDragOver={handleDragOver}
    >
      <div className="App-sideMenu">
        <SideMenu />
      </div>
      <div className="App-header">
        <Header />
      </div>
      <div className="App-content">
        {appContent}
      </div>
      {hasProjects &&
        errorMessage === undefined &&
        <div className="App-footer">
          <Legend />
        </div>}
    </div>
  );
}

export function mapStateToProps(state: State) {
  return {
    projectsByMonth: getProjectIdsByMonth(state),
    importFile
  };
}

function mapDispatchToProps(
  dispatch: Dispatch<*>,
  { readFileAsText }: { readFileAsText: File => Promise<string> }
) {
  return {
    importProject: (file: File) => dispatch(importProject(readFileAsText, file)),
    loadData: (data: Object) => {
      dispatch(loadAllData(data));
    }
  };
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppPresentation);
export default App;

function handleDragOver(e: Event) {
  e.preventDefault();
}

function handleDrop(importFile: File => void, e: DragEvent, loadData: Object => void) {
  e.preventDefault();
  const dt = e.dataTransfer;
  if (dt && dt.items) {
    const item = Array.prototype.find.call(
      dt.items,
      ({ kind }) => kind === "file"
    );
    if (item) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newData = e.target.result;
        var parsedData = importFile(newData);

        if (isOk(parsedData)) {
          loadData(parsedData.value);
        } else {
          alert("Oops, malformed JSON.\n\n" + parsedData.value);
        }

        // now update the url
        const urlEncodedState = btoa(JSON.stringify(JSON.parse(newData)));
        window.history.pushState("", "", "?roadmap=" + urlEncodedState);

      }

      reader.readAsText(item.getAsFile());

    }
    else
      console.log("No item found");
  } else {
    console.log("no files");
  }
}

function formatErrors(errorMessage: string | string[]) {
  if (typeof errorMessage === "string") return errorMessage;

  return (
    <ul>
      {errorMessage.map((message, i) => <li key={i}>{message}</li>)}
    </ul>
  );
}


