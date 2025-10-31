interface Config {
  database: {
    url: string;
  };
  jwt: {
    secret: string;
  };
  email: {
    resendApiKey: string;
    from: string;
  };
  app: {
    url: string;
    env: string;
  };
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarWithDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function loadConfig(): Config {
  const isDev = process.env.NODE_ENV !== "production";

  return {
    database: {
      url: isDev
        ? getEnvVarWithDefault("DATABASE_URL", "file:./prisma/dev.db")
        : getEnvVar("DATABASE_URL"),
    },
    jwt: {
      secret: isDev
        ? getEnvVarWithDefault("JWT_SECRET", "dev-secret-change-in-production")
        : getEnvVar("JWT_SECRET"),
    },
    email: {
      resendApiKey: getEnvVarWithDefault("RESEND_API_KEY", ""),
      from: getEnvVarWithDefault("RESEND_EMAIL_ADDRESS", "noreply@example.com"),
    },
    app: {
      url: getEnvVarWithDefault("APP_URL", "http://localhost:3000"),
      env: getEnvVarWithDefault("NODE_ENV", "development"),
    },
  };
}

export const config = loadConfig();
