import { createBrowserHistory, createHashHistory } from "history";
import { IS_APP_LIVE } from "../global/constants";

const history = IS_APP_LIVE ? createBrowserHistory() : createHashHistory();
export default history;
