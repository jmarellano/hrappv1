import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import routes from './routes';
Meteor.settings.public.collections = {};
db = {};
Meteor.startup(() => {
    db = {
        '#users': new Mongo.Collection('#users', { idGeneration: 'MONGO' }),
        '#task-lists': new Mongo.Collection('#task-lists', { idGeneration: 'MONGO' }),
    };
    for (let key in db) {
        db[key].deny({
            update() { return true; }
        });
    }
    render(routes, document.getElementById('app'));
    document.title = Meteor.settings.public.config.title;
});