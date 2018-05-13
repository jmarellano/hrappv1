import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import routes from './routes';
Meteor.settings.public.collections = {};
Meteor.startup(() => {
    render(routes, document.getElementById('app'));
    document.title = Meteor.settings.public.config.title;
});