import { Meteor } from 'meteor/meteor';
import { ROLES, isPermitted } from './classes/Const';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import CategoryManager from './classes/CategoryManager';

export const CategoriesAdd = 'categories_add';
export const CategoriesRemove = 'categories_remove';
export const ValidCategories = 'categories_valid';
export const CategoriesDB = new Mongo.Collection(Meteor.settings.public.collections.categories || 'categories', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
    functions[CategoriesAdd] = function (data) {
        try {
            check(this.userId, String);
            check(data, Object);
            let user = Meteor.user();
            if (user && isPermitted(user.profile.role, ROLES.VIEW_CATEGORIES)) {
                let category = new CategoryManager(data);
                category.flush();
                return ('New category added');
            }
            throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(`Method ${CategoriesAdd} error:`, err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    functions[CategoriesRemove] = function (categoryId) {
        try {
            categoryId = new Mongo.ObjectID(categoryId);
            check(this.userId, String);
            check(categoryId, Meteor.Collection.ObjectID);
            if (isPermitted(Meteor.user().profile.role, ROLES.VIEW_CATEGORIES))
                return CategoryManager.removeCategory(categoryId);
            else
                throw new Meteor.Error(403, 'Not authorized');
        } catch (err) {
            console.error(err);
            throw new Meteor.Error('bad', err.message);
        }
    };
    Meteor.publish(ValidCategories, function () {
        try {
            check(this.userId, String);
            return CategoriesDB.find();
        } catch (err) {
            throw new Meteor.Error('bad', err.message);
        }
    });
}