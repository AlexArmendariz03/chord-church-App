
export type AlignType = "left" | "center" | "right";

export type ExtraTextItem = {
    id: string;
    type: "tone";
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
};
export type Interfaces = {
    id: string;
    type: "content";
    text: string;
    x: number;
    y: number;
    width: number;
    color: string;
    fontSize: number;
    align: AlignType;
};

export type BoardConfig = {
    boardWidth: number;
    boardHeight: number;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    fontSize: number;
    padding: number;
    textAlign: AlignType;
    zoom: number;
};

export type SongPayload = {
    boardConfig: {
        stageWidth: number;
        stageHeight: number;
        boardX: number;
        boardY: number;
        boardWidth: number;
        boardHeight: number;
        backgroundColor: string;
        borderColor: string;
        textColor: string;
        fontSize: number;
        padding: number;
        textAlign: AlignType;
        zoom: number;
    };
    contentBlocks: Interfaces[];
    extraTexts: ExtraTextItem[];
};