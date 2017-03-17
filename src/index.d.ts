interface MessageEvents {
    type: 'message',
    replyToken: string,
    source: UserResponse,
    timestamp: number,
    message: TextReceivedMessage | LocationReceivedMessage | StickerReceivedMessage | BufferMessage,
    reply: (replyMessage: any) => Promise<{ any }>
}

interface FollowEvent {
    replyToken: string,
    type: 'follow',
    timestamp: number,
    source: UserResponse
    reply: (replyMessage: any) => Promise<{ any }>
}

interface UnFollowEvent {
    replyToken: string,
    type: 'unfollow',
    timestamp: number,
    source: UserResponse
}

interface TextReceivedMessage {
    type: 'text',
    id: number,
    text: string
}

interface LocationReceivedMessage {
    type: 'location',
    id: number,
    title: string,
    address: string,
    latitude: number,
    longitude: number
}

interface StickerReceivedMessage {
    type: 'sticker',
    id: number,
    packageId: string,
    stickerId: string
}

interface BufferMessage {
    type: 'image' | 'video' | 'audio',
    id: number,
    content: () => Promise<Buffer>
}

interface UserResponse {
    userId: string,
    type: string,
    profile: () => Promise<UserDetail>
}

interface UserDetail {
    displayName: string;
    userId: string;
    pictureUrl: string;
    statusMessage: string;
}

/**
 * https://devdocs.line.me/en/#send-message-object
 * 
 * on proccessing
 */
declare module MessageObject {
    interface Text {
        type: 'text',
        text: string
    }

    interface Image {
        type: 'image',
        originalContentUrl: string,
        previewImageUrl: string
    }

    interface Video{

    }

    interface Audio {

    }
}


