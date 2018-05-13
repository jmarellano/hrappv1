import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import Main from '../../ui/components/Main';
import NotFound from '../../ui/components/NotFound';

const customHistory = createBrowserHistory();
export default routes = (
    <Router history={customHistory}>
        <Switch>
            <Route path='/:component/:data' component={Main} />
            <Route path='/:component' component={Main} />
            <Route path='/' component={Main} />
            <Route component={NotFound} />
        </Switch>
    </Router>
);