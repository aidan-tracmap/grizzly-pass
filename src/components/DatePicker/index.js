// @flow

import moment from "moment";
import React, { PureComponent } from "react";
import { SingleDatePicker } from "react-dates";
import "./build/DatePicker.css";

type Props = {
  readonly: boolean,
  time: string,
  onTimeChange: string => void
};

type State = {
  focused: boolean,
  date: moment$Moment
};

export default class DatePicker extends PureComponent<void, Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      focused: false,
      date: moment(this.props.time)
    };
  }

  render() {
    const handleChange = date => {
      this.setState({ date });
      this.props.onTimeChange(date.format());
    };

    const { focused, date } = this.state;

    return (
      <div className="DatePicker">
        <SingleDatePicker
          date={date}
          onDateChange={handleChange}
          focused={focused}
          onFocusChange={({ focused }) => this.setState({ focused })}
          disabled={this.props.readonly}
          numberOfMonths={1}
          isOutsideRange={() => false}
          displayFormat="D MMMM"
        />
      </div>
    );
  }
}
