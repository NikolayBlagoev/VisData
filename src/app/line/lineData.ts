export type LineData = {
    date: Date,
    value: number
}

export type LineContainer = {
    data: LineData[],
    colour: string,
    label: string,
    highlight?: Date[]
}
