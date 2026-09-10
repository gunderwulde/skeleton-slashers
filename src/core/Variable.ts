export type VariableChangeListener<T> = (currentValue: T, previousValue: T) => void;

export class Variable<T extends number | string> {
    private value: T;
    private readonly listeners = new Set<VariableChangeListener<T>>();

    constructor(initialValue: T) {
        this.value = initialValue;
    }

    Set(nextValue: T): T {
        const previousValue = this.value;
        if (Object.is(previousValue, nextValue)) {
            return this.value;
        }

        this.value = nextValue;
        this.listeners.forEach((listener) => listener(this.value, previousValue));
        return this.value;
    }

    Get(): T {
        return this.value;
    }

    Subscribe(listener: VariableChangeListener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
