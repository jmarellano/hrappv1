import path from 'path';
import child_process from 'child_process';
import Future from 'fibers/future';

let isWindows = (process.env.OS && process.env.OS === 'Windows_NT');
let separator = isWindows ? '\\' : '/';
let basepath = path.resolve('.').split(separator + '.meteor')[0] + separator;

export default class WebShot {
    constructor(link, filePath, options, callback) {
        this.link = link;
        this.filePath = filePath;
        this.options = options;
        this.callback = callback;
        this.shot();
    }
    shot() {
        let retval = { error: null, data: null };
        let future = new Future();
        let spawn = child_process.spawn;
        // const ls = spawn(basepath + 'phantomjs', [
        //     '--local-to-remote-url-access=true',
        //     '--ssl-protocol=any',
        //     '--ignore-ssl-errors=true',
        //     '--web-security=false',
        //     basepath + '/public/js/phantomjs.execute.js',
        //     JSON.stringify(
        //         {
        //             link: this.link,
        //             filePath: this.filePath,
        //             crop: this.options.crop || { width: 240, height: 50 },
        //             window: this.options.window || { width: 1024, height: 768 },
        //             delay: this.options.delay || 1000
        //         }
        //     )
        // ]);
        const ls = spawn('/data/phantomjs', [
            '--local-to-remote-url-access=true',
            '--ssl-protocol=any',
            '--ignore-ssl-errors=true',
            '--web-security=false',
            '/data/phantomjs.execute.js',
            JSON.stringify(
                {
                    link: this.link,
                    filePath: this.filePath,
                    crop: this.options.crop || { width: 240, height: 50 },
                    window: this.options.window || { width: 1024, height: 768 },
                    delay: this.options.delay || 1000
                }
            )
        ]);
        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        ls.stderr.on('data', Meteor.bindEnvironment((data) => {
            console.log(`stderr: ${data}`);
        }));
        ls.on('close', Meteor.bindEnvironment(() => {
            console.log(`close`);
        }));
        ls.on('end', Meteor.bindEnvironment(() => {
            console.log(`end`);
        }));
        ls.on('exit', Meteor.bindEnvironment(() => {
            console.log(`exit`);
            future.return(retval);
        }));
        let val = future.wait();
        this.callback(val.error, val.data);
    }
}