"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const react_redux_1 = require("react-redux");
const App_1 = require("./App");
const reportWebVitals_1 = require("./reportWebVitals");
const store_1 = require("./store");
require("./index.css");
require("antd/dist/antd.css");
react_dom_1.default.render(<react_1.default.StrictMode>
    <react_redux_1.Provider store={store_1.store}>
      <App_1.default />
    </react_redux_1.Provider>
  </react_1.default.StrictMode>, document.getElementById('root'));
reportWebVitals_1.default();
//# sourceMappingURL=index.js.map