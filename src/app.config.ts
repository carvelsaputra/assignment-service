export const config = () => {
  const { env } = process;

  return {
    app: {
      name: 'Assignment Service',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    mysql: {
      username: env.DB_USERNAME,
      port: env.DB_PORT,
      host: env.DB_HOST,
      name: env.DB_NAME,
    },
  };
};

export type Config = ReturnType<typeof config>;
