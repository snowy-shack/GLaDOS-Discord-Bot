// Base class to inherit
abstract class Enum {
    private static registry = new Map<Function, Enum[]>();

    protected constructor() {
        let proto = Object.getPrototypeOf(this);
        while (proto && proto.constructor !== Enum) {
            const entries = Enum.registry.get(proto.constructor) || [];
            if (!entries.includes(this)) {
                entries.push(this);
                Enum.registry.set(proto.constructor, entries);
            }
            proto = Object.getPrototypeOf(proto);
        }
    }

    public static values<T extends typeof Enum>(this: T): { [K in keyof T]: any } extends { prototype: infer P } ? P[] : T[] {
        return (Enum.registry.get(this) || []) as any;
    }
}

// Example
class Direction extends Enum {
    public static readonly UP = new Direction();
    public static readonly DOWN = new Direction();
    public static readonly LEFT = new Direction();
    public static readonly RIGHT = new Direction();

    public getOpposite(): Direction {
        switch (this) {
            case Direction.UP:    return Direction.DOWN;
            case Direction.DOWN:  return Direction.UP;
            case Direction.LEFT:  return Direction.RIGHT;
            case Direction.RIGHT: return Direction.LEFT;
            default: throw new Error("Invalid direction");
        }
    }
}

class SpacialDirection extends Direction {
    public static readonly FORWARD = new SpacialDirection();
    public static readonly BACKWARD = new SpacialDirection();

    public getOpposite(): SpacialDirection {
        switch (this) {
            case SpacialDirection.BACKWARD: return SpacialDirection.FORWARD;
            case SpacialDirection.FORWARD: return SpacialDirection.BACKWARD;
            default: return super.getOpposite();
        }
    }
}

// Usage
const lookingDirection: Direction = Direction.UP;

for (const direction of Direction.values()) {
    console.log(direction.getOpposite())
}

const someDirections: Direction[] = [Direction.DOWN, Direction.LEFT];
