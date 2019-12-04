import React from 'react';
import { BrowserRouter as Switch, Route} from 'react-router-dom';
import Home from './Home';
import GameList from './GameList'
import Game from './Game';
import GameChat from './GameChat'

export default class App extends React.Component {
  render() {
    return (
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/gamelist' component={GameList} />
          <Route exact path='/game' component={Game} />
          <Route exact path='/gamechat' component={GameChat} />
        </Switch>
    );
  }
}