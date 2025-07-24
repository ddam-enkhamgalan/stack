import type { Request, Response, NextFunction } from 'express';

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const { method, url } = req;
  const userAgent = req.get('User-Agent') ?? 'Unknown';

  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  // Log response time
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    // eslint-disable-next-line no-console
    console.log(
      `[${timestamp}] ${method} ${url} - ${statusCode} - ${duration}ms`
    );
  });

  next();
};
