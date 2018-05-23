import { Meteor } from 'meteor/meteor';
export const LinkPreview = 'link-preview';
import { EmailFiles } from './files';
import { MessagesDB } from './messages';
import path from 'path';
import moment from 'moment';
let separator = (process.env.OS && process.env.OS === 'Windows_NT') ? '\\' : '/';
let basepath = path.resolve('.').split(separator + '.meteor')[0] + separator;

PATH = {
    BASE: basepath,
    UPLOAD: `${separator}data${separator}uploads${separator}`,
    INFECTED: `${separator}data${separator}infected${separator}`,
    THUMB: `${separator}data${separator}uploads${separator}thumb${separator}`,
    GIT: `${basepath}.git${separator}`,
    METEOR: `${basepath}.meteor${separator}`
};
if (Meteor.isServer) {
    functions[LinkPreview] = function (link, id) {
        try {
            this.unblock();
            let time = moment().valueOf();
            server.getWebshot(link, PATH.UPLOAD + id + time + '.png', { shotSize: { width: 150, height: 50 }, streamType: 'png', phantomConfig: { 'ignore-ssl-errors': 'true' } }, (err) => {
                if (err) {
                    console.log('method[%s]: %s.', LinkPreview, err.message);
                    let base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAIEAAABGCAMAAADckwduAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAACQUExURXV1dXh4eH19fYGBgYGBkoGBooGSsoGiwYSEhIiIiJKBgZKSgZKSkpKSopKiopKispKy0JmZmaCgoKKBgaKSgaKSkqKioqLB4Kenp66urrKSgbLB4LLQ4La2try8vMGigcHQ4MHg4MnJyc3NzdCyktDBotDBstDg4NfX19vb293d3eDBouDQsuDgweDg0ODg4FV51OEAAAIkSURBVGje7Zhhe4IgEMdFamW1Fq41bdnKakPW4vt/u3UojkWaPo9S27g3PMqL+3H/O+Bw+LXNsQSWwBJYAktgCSzBLyJgcUg8FyHXI2HMzBPQADuK4YCaJaA+ck4M+dQgQeQ6Z8xdmiJgfrZqEsWUMRpHJIuIz4wQJCPhrR8p7pKoL36OmAECJgBQeOKLhagVhDMEQoL+Rp/YiDD4rRNE4MY7m/bUg7llywQUqqBfUHcUouDSdglAA6RIAKtWhECN63BKQMFFyIsIeAiAaRA+H3Fqz40SBKABKyZgoEOQEXTGM7BVkwQMzoKIFxOIRMUZQXfdvAoxZBorI0hAprg9ApCZ8DICTmSiqAT7wWQ/xXdrOXL+9nTMkPuVOlmJgJyKoBNEEvInwXiAh921HPkW4/FsmmZp/rMKgSdDXEwAQnlqJr4IJ/juXRk/cBeWv8PgV/6sRADbES0noJAqajVOhOd0iXJ8zUpUjPJnJQJIM1ZOwGBH0FXoqeNh3lmI7y3wyUmTBPnUFvdqEtRToY0Y6JmomZKJhQQyDw7zNA9qEOjVePb0JpcI8lqAIqhFoO9Imik7UnYuLHSCYxDEfiDEqEUAIUZJGYC6K+O8HDUCvhti3HlY8boEdU6mlu4HNU7n699Q/uwt7QZuqnx57dv6DXQsF7o2YqBr++5cE71zJSY61xvo3iEdr/yCUfSKk/yvlyztNc++qVoCS2AJLIElsASG7AtXbvidM2aRqQAAAABJRU5ErkJggg==';
                    EmailFiles.write(new Buffer(base64Data, 'base64'), {
                        fileName: id + time + '.png',
                        type: 'image/png'
                    }, function (error, fileRef) {
                        if (error) {
                            console.log('method[%s]: %s.', LinkPreview, error.message);
                        } else {
                            MessagesDB.update({ messageId: id }, { $set: { imgUrl: EmailFiles.link(fileRef) } });
                        }
                    });
                }
                else
                    EmailFiles.addFile(PATH.UPLOAD + id + time + '.png', {}, function (error, fileRef) {
                        if (error) {
                            console.log('method[%s]: %s.', LinkPreview, error.message);
                        } else {
                            MessagesDB.update({ messageId: id }, { $set: { imgUrl: EmailFiles.link(fileRef) } });
                        }
                    });
            });
        } catch (err) {
            console.log('method[%s]: %s.', LinkPreview, err.message);
            throw err;
        }
    };
}