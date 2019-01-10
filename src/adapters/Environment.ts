
export class Environment {
    public static UseAdapters(defaultValue: boolean = true): boolean {
        return Environment.ReadEnvAsBool("USE_ADAPTERS", defaultValue);
    }

    private static ReadEnvAsBool(key: string, defaultValue: boolean): boolean {
        const envValue = process.env[key];
        let result = defaultValue;

        if (envValue) {
            const normalized = envValue.trim().toUpperCase();
            result = (normalized === "TRUE" || normalized === "1");
        }

        return result;
    }
}