# Application Components
Besides the core app (defined by the `app.component` files), the application is divided into a number of services which provide non-visualisation functionality, and several visualisation apps which provide the actual code needed to create the visualisation components. The services can be found in the current directory and each visualisation can be found in its corresponding directory

## Services
- `entry-tree` - Finds a game entry in the file tree
- `fetch` - Retrieves and parses a file from the file server
- `grading` - Calculates the grade of an amount for a metric (e.g. likes) of all games
- `id` - Generates a unique letter-only ID

## Visualisations
- `bar` - Generates a bar plot, where each bin is the key and the height is the value. Data is in the form of {Name: string, Value: number}
- `bin-scatter` - Scatter plot that makes use of hexagonal bins. Used to plot two numeric values against each other. Bins are colour coded based on how many samples fall within them. Expects data in the form of an array of (x, y) coordinate pairs (see `box/binScatterData.ts`), though it is unique amongst the visualisations in that it manages its own data loading instead of being fed data by the core application. Made possible using the [d3-hexbin library](https://github.com/d3/d3-hexbin)
- `box` - Box plot that shows statistical information about the distribution of particular quantities. Allows for particular points to be highlighted for each category in order to point out a sample within the distribution. See `box/boxData.ts` for an example of input data
- `donut` - Contains files related to the visualisation of a donut chart (pie chart with hole in the middle). Takes data in the form of two element array, where one element is the positive (ex. completion) value and the other is max - positive. The text for positive is displayed in the middle of the donut
- `line` - A line chart that supports multiple lines of different colors as well as the highlighting of points corresponding to particular x-axis data. Primarily intended for time series data. See `line/lineData.ts` for a specification of the expected input data
- `pie` - Displays elements which are parts of a whole. The values are shown outside the pie to avoid visual cluttering. Takes data in the form of a tuple array, where each entry is a slice. The first value in the tuple is the name of the element, the second value is the amount. The given values are converted to the ratio of the sum
- `radar` - Contains files related to the Radar (or spider/stand) chart. Creates an arbitrary many sides (one for reach feature). Takes data in the form of two field array, where second field is a string list of all the features, and the first one is an array of all the elements to be visualised.
- `scroll-list` - An 'infinite' scroll list that lazily loads new data as needed. (NOT USED IN THE FINAL APPLICATION DUE TO BEING DEEMED AS UNNECESSARY)
- `tooltip` - A tooltip intended to show hints and highlight particular data points. Utilised by the other components in this application
