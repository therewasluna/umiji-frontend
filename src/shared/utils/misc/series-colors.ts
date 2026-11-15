// Umiji's categorical chart colours: rose, blue, orchid, violet, sky. No yellow, green, orange or red,
// which stay reserved for status. Validated with the dataviz palette checker on the dark panel (#1B1218):
// adjacent CVD ΔE ≥ 11.3, normal-vision ΔE ≥ 18.4. Orchid sits under 3:1, so charts keep legends/labels.
export const SERIES_COLORS = ['#D44D8C', '#4680F1', '#8C36A4', '#9A7BF9', '#107DB2']

// Series past the fifth share one quiet tone instead of inventing more hues.
export const OTHER_SERIES_COLOR = '#584852'

// shortcut: slots follow the order given (callers pass a list ranked by traffic), so a node can change
// colour when the date range reorders the ranking; key by a stable node order if that starts to confuse.
export const seriesColorMap = (keys: string[]) =>
    new Map(keys.map((key, index) => [key, SERIES_COLORS[index] ?? OTHER_SERIES_COLOR]))
