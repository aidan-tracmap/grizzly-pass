// @flow

import React from "react";
import { shallow } from "enzyme";
import { Legend } from "../Legend";
import Label from "../Label";

const labels = [
  {
    id: "3",
    initial: "A",
    colour: "#ff0",
    title: "Apple"
  },
  {
    id: "4",
    initial: "O",
    colour: "#0ff",
    title: "Orange"
  }
];

const legend = shallow(<Legend labels={labels} />);

it("contains a <Label /> and title for each used label", () => {
  expect(legend.find(Label).length).toBe(2);
  expect(legend.find(".Legend-labelTitle").length).toBe(2);
});

it("passes label into to <Label /> props", () => {
  const legend = shallow(<Legend labels={labels.slice(0, 1)} />);
  expect(legend.find(Label).props()).toMatchObject({
    labelInfo: {
      id: "3",
      initial: "A",
      colour: "#ff0",
      title: "Apple"
    }
  });
});

it("uses readonly <Label />s", () => {
  const legend = shallow(<Legend labels={labels.slice(0, 1)} />);
  expect(legend.find(Label).prop("readonly")).toBe(true);
});

it("displays the labels title", () => {
  const legend = shallow(<Legend labels={labels.slice(0, 1)} />);
  expect(legend.find(".Legend-labelTitle").text()).toBe("Apple");
});
