// @flow

import React from "react";
import { connect } from "react-redux";
import type { State } from "../../reducer";
import { getTitle, getPublishDate } from "../../reducer";
import Logo from "../Logo";
import Selectable from "../Selectable";
import "./Header.css";

export function HeaderPresentation({ title, publishDate }: { title: ?string, publishDate: ?string }) {

  const publishDateDiv = publishDate
    ? <div className="Header-right-publishDate">As at {publishDate}</div>
    : null;


  const headerRight = title
    ? <div className="Header-right"><Selectable><h1>{title}</h1>{publishDateDiv}</Selectable></div>
    : <div className="Header-right" />;

  return (
    <header className="Header">
      <div className="Header-left">
        <Logo />
      </div>
      {headerRight}
    </header>
  );
}

const Header = connect((state: State) => ({
  title: getTitle(state),
  publishDate: getPublishDate(state)
}))(HeaderPresentation);

export default Header;
