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
  projectsByMonth: { year: number, data: { month: string, projectIds: string[] }[] }[],
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

  window.uglyHackLoadData = loadData; // I'm sorry, Phil.

  const years = projectsByMonth.map(({ year, data }) => {
    const months = data.map(monthInfo => {
      const cards = monthInfo.projectIds.map(projectId => (
        <div className="App-cardWrapper" key={projectId}>
          <Card projectId={projectId} />
        </div>
      ));
      return (
        <div key={monthInfo.month} className="App-month">
          <h2 className="App-monthTitle">{monthInfo.month}</h2>
          {cards}
        </div>
      );
    });

    return (
      <div className="App-year" key={year}>
        <h2>{year || 'UNKNOWN_YEAR'}</h2>
        <div className="App-months">
          {months}
        </div>
      </div>
    );
  });

  const hasProjects = !!projectsByMonth.length;

  const isBlank = location.pathname.length <= 1;

  const appContent = errorMessage != null ?
    formatErrors(errorMessage) :
    (hasProjects ?
      years :
      isBlank ? "Drop a roadmap JSON file here." : ""
    );

  return (
    <div
      className="App"
      onDrop={e => handleDrop(importFile, e, loadData)}
      onDragOver={handleDragOver}
    >
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

function handleData(newData, loadData, isDrop) {
  var parsedData = importFile(newData, isDrop ? Date.now() : undefined);

  if (isOk(parsedData)) {
    loadData(parsedData.value);
  } else {
    alert("Oops, malformed JSON.\n\n" + parsedData.value);
  }

  if (isDrop) {
    // add the data to the url
    const urlPayload = {
      publishDate: Date.now(),
      data: JSON.parse(newData)
    }
    const urlEncodedState = btoa(JSON.stringify(urlPayload));
    window.history.pushState("", "", "/?roadmap=" + urlEncodedState);
  }
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
        handleData(newData, loadData, true);
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


function initRave() {
  const raveColours = ["fff582", "ffb6f9", "c0ff9f", "59ffc2", "98f5ff", "d1c1ff"];
  var nextRaveColour = Math.floor(Math.random() * raveColours.length);
  function randomRaveColour() {
    return "#" + raveColours[(nextRaveColour++) % raveColours.length];
  }

  const recentKeyPresses = [];
  const SECRET_DANCE_PARTY_CODE = "rave";
  window.addEventListener('keydown', function (e) {
    recentKeyPresses.push(e.key);
    while (recentKeyPresses.length > SECRET_DANCE_PARTY_CODE.length) {
      recentKeyPresses.splice(0, 1);
    }
    if (recentKeyPresses.join('').toLowerCase() === SECRET_DANCE_PARTY_CODE) {
      document.querySelectorAll(".Card").forEach((card, i) =>
        setTimeout(function () {
          card.classList.add('dancing');
          card.classList.remove('isTentative');
          card.style.background = randomRaveColour();
        }, i * 50)
      )
      document.body.style.background = "#5a0d82";
      document.querySelector(".App-header").style.display = "none";
      document.querySelector(".App-footer").style.display = "none";

      var appElement = document.querySelector(".App");
      function rotateBackground(time) {
        appElement.style.background = "radial-gradient(#5a0d82, #c31bc3 " + (time * 0.3) % 300 + "%, #5a0d82)"
        requestAnimationFrame(rotateBackground);
      }
      requestAnimationFrame(rotateBackground);
    }
  });
}
initRave();


window.addEventListener('load', function () {
  var roadmapData = window.getQueryData();
  if (typeof roadmapData === "undefined" && location.pathname.length > 1) {
    var URL_BASE = "https://s3-ap-southeast-2.amazonaws.com/tracmap/roadmap";

    // This cache buster only works for S3. http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html?r=5225
    var cacheBust = "?cache-buster=" + Date.now();

    var dataUrl = URL_BASE + location.pathname + ".json" + cacheBust;
    fetch(dataUrl).then(x => x.text()).then(x => {
      handleData(x, window.uglyHackLoadData);
    });
  }
});
