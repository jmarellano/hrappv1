export const ROUTES = {
    MESSAGES: '',
    DRIVE: 'drive',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'reset-password',
    RESET_PASSWORD: 'reset',
    VERIFY: 'verify-email',
    FIRST: 'first',
    EMAILS: 'email',
    TEAMS: 'team',
    REQUESTS: 'request',
    REQUESTS_ADMIN: 'request-admin',
    FORMS_CREATOR: 'forms-creator',
    FORMS_VIEWER: 'forms-viewer',
    FORMS_DATA: 'forms-data',
    FORMS_NOT_FOUND: 'forms-not-found',
    TEMPLATES_CREATOR: 'templates-creator',
    STATISTICS: 'statistics',
    FILES: 'files'
};

let ROLES_ = {
    NONE: 0,
    VIEW_MESSAGES: 0x1 << 0,
    VIEW_CATEGORIES: 0x2 << 1,
    VIEW_TEAMS: 0x3 << 2,
    VIEW_STATISTICS: 0x4 << 3,
    IMPORT_PST: 0x5 << 4,
    IMPORT_DATE: 0x6 << 5,
    IMPORT_RECORDS: 0x7 << 6,
    VIEW_FORMS: 0x8 << 7,
    VIEW_DRIVE: 0x9 << 8,
    VIEW_EMAILS: 0x10 << 9,
    MANAGE_FILES: 0x11 << 10,
    MANAGE_FORMS: 0x12 << 11,
    MANAGE_EMAILS: 0x13 << 12,
    ALL: 0xFFFFFF
};
ROLES_.GUESTS = ROLES_.NONE;
ROLES_.STAFFS = (ROLES_.VIEW_MESSAGES | ROLES_.IMPORT_PST | ROLES_.IMPORT_DATE | ROLES_.IMPORT_RECORDS | ROLES_.VIEW_FORMS | ROLES_.VIEW_DRIVE | ROLES_.VIEW_EMAILS);
ROLES_.ADMIN = (ROLES_.STAFFS | ROLES_.VIEW_CATEGORIES | ROLES_.VIEW_TEAMS | ROLES_.VIEW_STATISTICS | ROLES_.MANAGE_FILES | ROLES_.MANAGE_FORMS | ROLES_.MANAGE_EMAILS);
ROLES_.SUPERUSER = ROLES_.ALL;

export const ROLES = ROLES_;
export const isPermitted = (role, permission) => {
    return !(!(parseInt(role) & permission));
};

export const RETIRED = {
    FALSE: 0,
    TRUE: 1
};
export const VERIFIED = {
    FALSE: false,
    TRUE: true
};

export const DRIVE = {
    ALL: 0,
    DOCUMENTS: 1,
    PDF: 2,
    SHEETS: 3,
    FILES: 4,
    IMAGES: 5,
    VIDEOS: 6,
    AUDIO: 7,
    TRASHED: 8
}

export const VALUE = {
    TRUE: 1,
    FALSE: 0
}

export const MESSAGES_TYPE = {
    EMAIL: 1,
    SMS: 2,
    SKYPE: 3,
}