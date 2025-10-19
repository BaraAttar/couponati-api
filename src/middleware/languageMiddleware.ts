import type { Request, Response, NextFunction } from "express";

export enum Language {
  Arabic = "ar",
  English = "en",
}

declare module "express-serve-static-core" {
  interface Request {
    language?: Language;
  }
}

export const languageMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  let header = req.headers["accept-language"];
  if (Array.isArray(header)) header = header[0];
  if (!header || header.trim() === "") header = "en";

  const langCode = header.split(",")[0]?.slice(0, 2).toLowerCase();
  // Treat Arabic explicitly; default to English for any other/unknown codes
  req.language = langCode === "ar" ? Language.Arabic : Language.English;
  next();
};
