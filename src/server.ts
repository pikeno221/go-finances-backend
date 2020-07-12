import app from './app';
import AppError from './errors/AppError';
import express, { NextFunction, Request, Response } from 'express';

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333!');
});

app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
  if (err instanceof AppError) {
      return response.status(err.statusCode).json({
          message: err.message,
      });

      console.log(err);

      return response.status(500).json({
          message: 'Unknown error occorried. ',
      });


  }

})
