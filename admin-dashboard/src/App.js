import './App.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Home from "./components/pages/home/Home";
import Login from "./components/pages/login/Login";
import Foto from "./components/pages/foto/Foto";
import Leaderboard from './components/pages/leaderboard/Leaderboard';
import Report from './components/pages/report/Report';
import ReportInfo from './components/pages/report/ReportInfo';
import Utenti from './components/pages/utenti/Utenti';
import UtentiInfo from './components/pages/utenti/UtentiInfo';
import Game from './components/pages/game/Game';
import GameInfo from './components/pages/game/GameInfo';
import ChangeConsent from './components/pages/ChangeConsent/ChangeConsent';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route exact path="/login">
          <Login />
        </Route>

        <Route exact path="/foto">
          <Foto />
        </Route>

        <Route exact path="/leaderboard">
          <Leaderboard />
        </Route>

        <Route exact path="/report">
          <Report />
        </Route>

        <Route exact path="/report/:id">
          <ReportInfo />
        </Route>

        <Route exact path="/user">
          <Utenti />
        </Route>

        <Route exact path="/user/:id">
          <UtentiInfo />
        </Route>

        <Route exact path="/game">
          <Game />
        </Route>

        <Route exact path="/game/:id">
          <GameInfo />
        </Route>

        <Route exact path="/consent">
          <ChangeConsent />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
