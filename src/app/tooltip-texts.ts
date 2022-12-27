import { TooltipComponent } from "./tooltip/tooltip.component";

const ownerScaleText = `0..20,000 ➜ 0
20,000..50,000              ➜ 0.5
50,000..100,000             ➜ 1
100,000..200,000            ➜ 2
200,000..500,000            ➜ 3
500,000..1,000,000          ➜ 4
1,000,000..2,000,000        ➜ 5
2,000,000..5,000,000        ➜ 6
5,000,000..10,000,000       ➜ 7
10,000,000..20,000,000      ➜ 7.5
20,000,000..50,000,000      ➜ 8
50,000,000..100,000,000     ➜ 9
100,000,000..200,000,000    ➜ 9.5
200,000,000..500,000,000    ➜ 10`;

export function onEnterGameReviews() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows positive reviews as percentage of total reviews for Steam user scores, Metacritic critic scores, and Metacritic user scores. If a game does not have Metacritic reviews, a pie chart of Steam user scores only is shown instead");
}

export function onEnterLikes30Days() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows ????");
}

export function onEnterGenreCount() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows the number of games made per genre (limited to genres above a certain threshold). Highlighted are the genres of the selected game\r\nNOTE: A game can be in multiple genres");
}

export function onEnterCCU30Days() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows peak active players for each day for the given time period");
}

export function onEnterGameCompletion() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows the heuristically determined percentage of total players who have completed the game");
}

export function onEnterNumericData() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "650px");
    t.setText("Shows two pieces of numeric data plotted against each other for all Steam games. " +
              "The 'Owners' metric maps a range of values for owners as follows:\r\n" +
               ownerScaleText);
}

export function onEnterPriceBrackets() {
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Shows the price distribution of games on Steam");
}

export function onEnterPopularityMetrics(){
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "650px");
    t.setText("Shows information about likes, playtime, and number of owners. " +
              "The radar chart on the left has axes normalised to the range [1,10] and shows values for the selected game (blue) and the Steam-wide average (purple). " +
              "The box plot on the right displays raw values and highlights the selected game. " +
              "The 'Owners' metric maps a range of values for owners as follows:\r\n" +
               ownerScaleText);
}

export function onEnterAllGamesTitle(){
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Aggreggate information about all Steam games. Each visualisation highlights where the selected game lies within the data.");
}

export function onEnterGenreTitle(){
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Aggreggate information about the genres that the selected game falls under. Each visualisation highlights where the selected game lies within the data.");
}

export function onEnterGenreReleaseTimeline(){
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Number of released games released for this genre over time. The selected game is highlighted");
}

export function onEnterCcuTimeline(){
    const t = new TooltipComponent();
    t.setVisible();
    t.tooltip.style("max-width", "400px");
    t.setText("Peak concurrent users (CCU) over time. The genre-wide average is plotted in blue while the selected game is plotted in purple");
}

export function onLeaveSectionInfo() {
    const t = new TooltipComponent();
    t.setHidden();
}
