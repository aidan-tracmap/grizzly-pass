// @flow

import debugFactory from "debug";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { loadDemoData, loadAllData } from "./actions";
import { importFile } from './import';
import App from "./components/App";
import { readFileAsText } from "./file-utils";
import reducer from "./reducer";
import "./index.css";

import { unsafeUnwrap } from './result';

const debug = debugFactory("gp:main");
debugFactory.log = console.log.bind(console);

const { version: appVersion } = require("../package.json");

async function run() {
  console.log(appVersion);

  const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
  store.dispatch(loadDemoData());

  const queryData = getQueryData();
  if (queryData) {
    console.log("loading", queryData);
    const queryDataStr = JSON.stringify(queryData);
    const importDataPayload = unsafeUnwrap(importFile(queryDataStr));
    console.log("queryData", queryData);
    console.log("importDataPayload", importDataPayload);
    store.dispatch(loadAllData(importDataPayload));
  }

  render(
    <Provider store={store}>
      <App readFileAsText={readFileAsText(FileReader)} />
    </Provider>,
    document.getElementById("root")
  );
}

run().catch(e => debug(e.stack || e));

function getQueryData() {
  var query = {};
  if (location.search.length > 2) {
    query = location.search.substr(1)
      .split("&").map(
      x => x.split('=')
      ).reduce((memo, x, i, a) => {
        memo[x[0]] = x[1]; return memo;
      }, {})
  }

  if (query.roadmap) {
    var roadmapData = JSON.parse(atob(query.roadmap));
    return roadmapData;
  }
}
