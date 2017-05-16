// @flow

import React from "react";
import { connect } from "react-redux";
import type { State } from "../../reducer";
import { getUsedLabels, getLabelInfo } from "../../reducer";
import type { LabelInfo } from "../../types";
import Label from "../Label";
import "./Legend.css";

type LegendProps = {
  labels: LabelInfo[]
};

export function LegendPresentation({ labels }: LegendProps) {
  const labelElems = labels.map(labelInfo => {
    return (
      <div className="Legend-labelWrapper" key={labelInfo.id}>
        <Label labelInfo={labelInfo} readonly={true} />
        <div className="Legend-labelTitle">{labelInfo.title}</div>
      </div>
    );
  });

  return (
    <div className="Legend">
      <div className="Legend-title">Teams:</div>
      <div className="Legend-labels">
        {labelElems}
      </div>
    </div>
  );
}

const Legend = connect(mapStateToProps)(LegendPresentation);
export default Legend;

function mapStateToProps(state: State) {
  const usedLabels = getUsedLabels(state);
  return {
    labels: usedLabels.map(id => getLabelInfo(state, id))
  };
}
