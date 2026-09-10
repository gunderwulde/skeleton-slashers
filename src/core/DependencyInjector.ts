import type { IPlayer } from '../interfaces/IPlayer';

/** Static dependency container for global references. */
export class DependencyInjector {
    private static readonly dependencies = new Map<string, unknown>();

    private constructor() {}

    static Register<T>(key: string, instance: T): void {
        DependencyInjector.dependencies.set(key, instance);
    }

    static Resolve<T>(key: string): T {
        const dependency = DependencyInjector.dependencies.get(key) as T | undefined;
        if (dependency === undefined) {
            throw new Error(`Dependency "${key}" is not registered.`);
        }
        return dependency;
    }
}
