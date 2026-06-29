/** A translation catalog: nested namespaces of message strings. */
export type Messages = { [key: string]: string | Messages };

/** Values interpolated into a message via `{name}` placeholders. */
export type TParams = Record<string, string | number>;
