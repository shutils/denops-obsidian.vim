import { datetime, eta, path } from "../deps.ts";

const EXTENDS = {
  datetime: datetime,
};

export function renderTemplate(templateFilePath: string) {
  const parsedTemplateFilePath = path.parse(templateFilePath);
  const e = new eta.Eta({ views: parsedTemplateFilePath.dir, autoTrim: false });
  return e.render(parsedTemplateFilePath.base, EXTENDS);
}
