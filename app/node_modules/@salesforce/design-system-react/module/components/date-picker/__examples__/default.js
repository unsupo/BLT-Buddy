function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable no-console, react/prop-types */
import React from 'react';
import moment from 'moment';
import IconSettings from "../../../../components/icon-settings";
import Datepicker from "../../../../components/date-picker";

var Example =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Example, _React$Component);

  function Example() {
    var _this;

    _classCallCheck(this, Example);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Example).call(this));

    _defineProperty(_assertThisInitialized(_this), "handleChange", function (event, data) {
      _this.setState({
        value: data.date
      });
    });

    _this.state = {
      value: undefined
    };
    return _this;
  }

  _createClass(Example, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(IconSettings, {
        iconPath: "/assets/icons"
      }, React.createElement(Datepicker, {
        labels: {
          label: 'Date'
        },
        onChange: function onChange(event, data) {
          _this2.handleChange(event, data);

          if (_this2.props.action) {
            var dataAsArray = Object.keys(data).map(function (key) {
              return data[key];
            });

            _this2.props.action('onChange').apply(void 0, [event, data].concat(_toConsumableArray(dataAsArray)));
          } else if (console) {
            console.log('onChange', event, data);
          }
        },
        onCalendarFocus: function onCalendarFocus(event, data) {
          if (_this2.props.action) {
            var dataAsArray = Object.keys(data).map(function (key) {
              return data[key];
            });

            _this2.props.action('onCalendarFocus').apply(void 0, [event, data].concat(_toConsumableArray(dataAsArray)));
          } else if (console) {
            console.log('onCalendarFocus', event, data);
          }
        },
        formatter: function formatter(date) {
          return date ? moment(date).format('M/D/YYYY') : '';
        },
        parser: function parser(dateString) {
          return moment(dateString, 'MM-DD-YYYY').toDate();
        },
        value: this.state.value
      }));
    }
  }]);

  return Example;
}(React.Component);

_defineProperty(Example, "displayName", 'DatepickerExample');

export default Example; // export is replaced with `ReactDOM.render(<Example />, mountNode);` at runtime
//# sourceMappingURL=default.js.map