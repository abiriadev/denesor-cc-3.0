export interface Log {
    message: string
    type: string
    date: Date
}

export class Logbox {
    private data: Array<Log>

    constructor(init?: Array<Log>) {
        this.data = init || []
    }

    push(data: Log): this {
        this.data.push(data)
        return this
    }

    log(message: string, type: string): this {
        return this.push({
            message,
            type,
            date: new Date(),
        })
    }

    toArray(): Array<Log> {
        return this.data
    }

    filter(types: Array<string>): Logbox {
        return new Logbox(this.data.filter((d: Log) => types.includes(d.type)))
    }

    toString(): string {
        return this.data
            .map(
                (data: Log) =>
                    `[${data.date.toUTCString()}] ${data.type}: ${
                        data.message
                    }`,
            )
            .join('\n')
    }
}
