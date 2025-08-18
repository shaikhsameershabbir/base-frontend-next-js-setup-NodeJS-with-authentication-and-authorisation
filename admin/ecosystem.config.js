module.exports = {
    apps: [
        {
            name: 'matka-admin',
            script: 'npm',
            args: 'start',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3012,
                HOSTNAME: '0.0.0.0'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3012,
                HOSTNAME: '0.0.0.0',
                NEXT_PUBLIC_API_URL: 'http://104.248.144.160:5555/api/v1'
            },
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        }
    ]
};
