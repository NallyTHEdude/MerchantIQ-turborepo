import Busboy from "busboy";
import type { NextFunction, Request, Response } from "express";

import { validateDocument } from "@/app/validators/document.validator";
import { ApiError } from "@/utils/errors/ApiError";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

export const documentUpload = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
    //  console.log("content-type received:", req.headers["content-type"]);
    //  console.log("all headers:", req.headers);
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: 10 * 1024 * 1024,
    },
  });

  let handedOff = false;
  let failed = false;

  const fail = (error: unknown) => {
    if (failed || handedOff) {return;}

    failed = true;
    next(error);
  };

  busboy.on("file", (_fieldName, file, info) => {

    file.on("limit", () => {
      file.unpipe();
      file.destroy(new Error("File size must not exceed 10 MB"));
    });

    try {
      validateDocument(info.filename, info.mimeType);
    } catch (error) {
      file.resume();
      fail(error);
      return;
    }

    req.fileStream = file;
    req.fileOriginalName = info.filename;
    handedOff = true;
    next();
  });

  busboy.on("finish", () => {
    if (handedOff || failed) {return;}

    fail(new ApiError(StatusCodes.BAD_REQUEST, "Document is required"));
  });

  busboy.on("error", (error) => {
    fail(error);
  });

  req.pipe(busboy);
};
