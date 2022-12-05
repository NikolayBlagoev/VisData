export type BoxData = {
    label: string,
    min: number,
    max: number,
    median: number,
    lower_quartile: number,
    upper_quartile: number
};

// Example data
export const ExampleLabels:Array<string> = [
    'ur',
    'mom',
    'my',
    'balls'
];
export const ExampleData:Array<BoxData> = [
    {label: 'ur', min: 20, max: 580, median: 270, lower_quartile: 180, upper_quartile: 420},
    {label: 'mom', min: 59, max: 77, median: 66, lower_quartile: 64.5, upper_quartile: 70},
    {label: 'my', min: 20, max: 580, median: 270, lower_quartile: 180, upper_quartile: 420},
    {label: 'balls', min: 59, max: 77, median: 66, lower_quartile: 64.5, upper_quartile: 70}
];
