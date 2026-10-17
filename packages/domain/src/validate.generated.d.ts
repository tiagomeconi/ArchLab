export interface SchemaError { instancePath: string; message?: string; keyword?: string; params?: unknown }
declare const validate: ((data: unknown) => boolean) & { errors?: SchemaError[] | null };
export default validate;
export { validate };
