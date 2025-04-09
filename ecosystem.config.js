module.exports = {
  apps: [
    {
      name: "vibe-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: "max", // Use maximum number of CPU cores
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
