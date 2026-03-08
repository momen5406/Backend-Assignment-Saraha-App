import { tokenType } from "../common/constant/index.js";
import { BadRequestException, decodeToken, ForbiddenException, UnauthorizedException } from "../common/utils/index.js";
import { login } from "../modules/auth/auth.service.js";

export const authentication = (tokenT = tokenType.Access) => {
  return async (req, res, next) => {
    const [schema, credentials] = req.headers.authorization?.split(" ") || [];

    if (!schema || !credentials) throw new UnauthorizedException("Missing authentication key or invalid approach");

    switch (schema) {
      case "Basic":
        const [email, password] = Buffer.from(credentials, "base64")?.toString()?.split(":") || [];
        await login({ email, password });
        break;

      case "Bearer":
        req.user = await decodeToken(credentials, tokenT);
        break;

      default:
        throw new BadRequestException("Missing authentication schema");
        break;
    }

    next();
  };
};

export const authorization = (accessRoles = []) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      throw new ForbiddenException("Not authorized account");
    }

    next();
  };
};
