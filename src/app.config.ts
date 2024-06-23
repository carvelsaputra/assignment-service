export const config = () => {
  const { env } = process;

  return {
    app: {
      name: 'Assignment Service',
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    mysql: {
      username: env.DB_USERNAME,
      port: env.DB_PORT,
      host: env.DB_HOST,
      name: env.DB_NAME,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  };
};

export type Config = ReturnType<typeof config>;
