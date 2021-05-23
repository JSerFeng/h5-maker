import { request, Res } from ".";
import { RenderConfig } from "../render/interfaces";

export const apiGenCode = (renderConfig: RenderConfig) => request.post("/generate", { renderConfig }) as Promise<Res>
