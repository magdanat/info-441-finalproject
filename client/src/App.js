import React from 'react';
import { BrowserRouter as Switch, Route} from 'react-router-dom';
import Home from './Home';
import GameList from './GameList'
import Game from './Game';

export default class App extends React.Component {
  render() {
    return (
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/gamelist' component={GameList} />
          <Route exact path='/game' component={Game} />
        </Switch>
    );
  }
}