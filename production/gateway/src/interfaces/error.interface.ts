export class StandardErrorResponse {
  statusCode: number;
  error: string;
}

export const isError = (obj: unknown): obj is StandardErrorResponse => {
  return (
    (obj as StandardErrorResponse).statusCode !== undefined &&
    (obj as StandardErrorResponse).error !== undefined
  );
};
