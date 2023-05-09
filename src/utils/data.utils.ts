const getRandom = (min: number, max: number) =>
    Math.random() * (max - min) + min;

export type FeedItem = {
    name: string;
    url: string;
    description: string;
}

export const getItem = (index: number): FeedItem => {
    return {
        name: `Random Name - ${index}`,
        description: `Random description - - Lorem ipsum sit met, consectetur adipiscing elit`,
        url: `https://www.belvedere.at/sites/default/files/2022-04/912.jpg`
    };
};