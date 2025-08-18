module.exports = {
    apps: [
        {
            name: 'website-mk',
            script: 'npm',
            args: 'run start:prod',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3013,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3013,
            },
            // Logging configuration
            log_file: './logs/app.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

            // Advanced configuration
            min_uptime: '10s',
            max_restarts: 10,

            // Health check
            health_check_url: 'http://104.248.144.160:3013',
            health_check_grace_period: 3000,

            // Environment-specific settings
            kill_timeout: 5000,
            listen_timeout: 8000,

            // Cluster mode (optional - uncomment if you want to use cluster mode)
            // instances: 'max',
            // exec_mode: 'cluster',
        }
    ],

    // Deployment configuration (optional)
    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'your-git-repository',
            path: '/var/www/website-frontend',
            'post-deploy': 'npm install && npm run build:prod && pm2 reload ecosystem.config.js --env production',
            env: {
                NODE_ENV: 'production',
                PORT: 3013,
            }
        }
    }
};
