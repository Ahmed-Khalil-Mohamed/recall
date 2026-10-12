import { recall } from "../apps/recall/domain";
export const projects = [recall];
export const findProject = (id: string) =>
  projects.find((project) => project.id === id);
