const convict = require('convict');

const config = convict({
    env: {
        doc: 'App env',
        format: ['development'],
        env: 'NODE_ENV',
        arg: 'env'
    },
    server: {
        ip: {
            doc: 'IP-address',
            format: 'ipaddress',
            default: '127.0.0.1',
            env: 'IP_ADDRESS'
        },
        port: {
            doc: 'HTTP port',
            format: 'port',
            default: 3000,
            env: 'HTTP_PORT'
        }
    }
});

config.loadFile('./config/config.json');
config.validate();

module.exports = config;